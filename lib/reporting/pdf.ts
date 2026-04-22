import PDFDocument from "pdfkit";
import type { ReportData, ReportMission } from "@/lib/reporting/types";

const COLORS = {
    primary: "#4F46E5",
    primarySoft: "#EEF2FF",
    text: "#0F172A",
    muted: "#64748B",
    border: "#E2E8F0",
    surface: "#F8FAFC",
    success: "#059669",
    danger: "#DC2626",
};

function collectPdfBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);
    });
}

function ensureSpace(doc: PDFKit.PDFDocument, requiredHeight: number) {
    const bottomLimit = doc.page.height - doc.page.margins.bottom;
    if (doc.y + requiredHeight > bottomLimit) {
        doc.addPage();
    }
}

function truncate(text: string, maxLength: number): string {
    return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
}

function formatDelta(delta: number | null | undefined, suffix = "%"): string | null {
    if (delta == null) return null;
    const sign = delta >= 0 ? "+" : "";
    return `${sign}${delta}${suffix}`;
}

function buildInsights(data: ReportData): string[] {
    const insights: string[] = [];

    if (data.meetingsDelta != null) {
        insights.push(
            data.meetingsDelta >= 0
                ? `La prise de rendez-vous progresse de ${data.meetingsDelta}% par rapport a la periode precedente.`
                : `La prise de rendez-vous recule de ${Math.abs(data.meetingsDelta)}% par rapport a la periode precedente.`
        );
    }

    if (data.meetingsByPeriod.length > 0) {
        const bestPeriod = data.meetingsByPeriod.reduce((best, current) =>
            current.count > best.count ? current : best
        );
        insights.push(`Le meilleur mois observe sur la periode est ${bestPeriod.label} avec ${bestPeriod.count} RDV.`);
    }

    if (data.conversionRate >= 20) {
        insights.push(`Le taux de conversion de ${data.conversionRate}% indique une prospection efficace sur les contacts touches.`);
    } else if (data.contactsReached > 0) {
        insights.push(`Le taux de conversion reste a ${data.conversionRate}%, ce qui laisse une marge d'amelioration sur la qualification et le closing.`);
    }

    if (data.opportunities > 0) {
        insights.push(`${data.opportunities} opportunite${data.opportunities > 1 ? "s" : ""} ont ete detectee${data.opportunities > 1 ? "s" : ""}, signe d'un pipeline exploitable.`);
    }

    const activeMissions = data.missions.filter((mission) => mission.isActive).length;
    if (data.missions.length > 1) {
        insights.push(`${activeMissions} mission${activeMissions > 1 ? "s" : ""} active${activeMissions > 1 ? "s" : ""} sur ${data.missions.length} alimentent ce rapport.`);
    }

    if (insights.length === 0) {
        insights.push("Aucune tendance marquee n'a ete detectee sur la periode selectionnee.");
    }

    return insights.slice(0, 4);
}

function drawStatCard(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    width: number,
    height: number,
    title: string,
    value: string,
    delta?: string | null
) {
    doc.roundedRect(x, y, width, height, 14).fillAndStroke(COLORS.surface, COLORS.border);
    doc.fillColor(COLORS.muted).font("Helvetica").fontSize(10).text(title, x + 16, y + 14);
    doc.fillColor(COLORS.text).font("Helvetica-Bold").fontSize(22).text(value, x + 16, y + 34, {
        width: width - 32,
    });

    if (delta) {
        const deltaColor = delta.startsWith("-") ? COLORS.danger : COLORS.success;
        doc.fillColor(deltaColor).font("Helvetica-Bold").fontSize(10).text(delta, x + 16, y + height - 24);
    }
}

function drawSectionTitle(doc: PDFKit.PDFDocument, title: string) {
    doc.fillColor(COLORS.text).font("Helvetica-Bold").fontSize(14).text(title);
    doc.moveDown(0.5);
}

function drawTrendRows(doc: PDFKit.PDFDocument, periods: ReportData["meetingsByPeriod"]) {
    const rows = periods.slice(-8);
    const max = Math.max(1, ...rows.map((row) => row.count));
    const left = doc.page.margins.left;
    const totalWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const labelWidth = 74;
    const valueWidth = 36;
    const barWidth = totalWidth - labelWidth - valueWidth - 20;

    if (rows.length === 0) {
        doc.fillColor(COLORS.muted).font("Helvetica").fontSize(10).text("Aucun RDV enregistre sur la periode.");
        doc.moveDown(0.4);
        return;
    }

    for (const row of rows) {
        ensureSpace(doc, 26);
        const y = doc.y;
        const fillWidth = Math.max(8, (row.count / max) * barWidth);

        doc.fillColor(COLORS.muted).font("Helvetica").fontSize(10).text(row.label, left, y + 5, {
            width: labelWidth,
        });
        doc.roundedRect(left + labelWidth + 8, y + 6, barWidth, 10, 5).fill("#E5E7EB");
        doc.roundedRect(left + labelWidth + 8, y + 6, fillWidth, 10, 5).fill(COLORS.primary);
        doc.fillColor(COLORS.text).font("Helvetica-Bold").fontSize(10).text(String(row.count), left + labelWidth + barWidth + 16, y + 4, {
            width: valueWidth,
            align: "right",
        });
        doc.y = y + 24;
    }
}

function drawMissionCard(doc: PDFKit.PDFDocument, mission: ReportMission) {
    const left = doc.page.margins.left;
    const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const objectiveText = mission.objective ? truncate(mission.objective, 180) : null;
    const bodyText = `${mission.sdrCount} SDR • ${mission.startDate} -> ${mission.endDate}`;
    const objectiveHeight = objectiveText
        ? doc.heightOfString(objectiveText, { width: width - 32, align: "left" })
        : 0;
    const cardHeight = 58 + objectiveHeight;

    ensureSpace(doc, cardHeight + 10);

    const y = doc.y;
    doc.roundedRect(left, y, width, cardHeight, 14).fillAndStroke("#FFFFFF", COLORS.border);
    doc.fillColor(COLORS.text).font("Helvetica-Bold").fontSize(11).text(mission.name, left + 16, y + 14, {
        width: width - 120,
    });
    doc.fillColor(mission.isActive ? COLORS.success : COLORS.muted)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(mission.isActive ? "ACTIF" : "INACTIF", left + width - 72, y + 16, {
            width: 56,
            align: "right",
        });
    doc.fillColor(COLORS.muted).font("Helvetica").fontSize(9).text(bodyText, left + 16, y + 34);

    if (objectiveText) {
        doc.fillColor(COLORS.text).font("Helvetica").fontSize(9).text(objectiveText, left + 16, y + 50, {
            width: width - 32,
        });
    }

    doc.y = y + cardHeight + 10;
}

export async function generateClientReportPdf(data: ReportData): Promise<Buffer> {
    const doc = new PDFDocument({
        size: "A4",
        margins: { top: 48, right: 48, bottom: 48, left: 48 },
        info: {
            Title: `Rapport d'activite - ${data.clientName}`,
            Author: "Captain Prospect CRM",
            Creator: "Captain Prospect CRM",
        },
    });

    const bufferPromise = collectPdfBuffer(doc);
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const left = doc.page.margins.left;

    doc.roundedRect(left, 48, pageWidth, 126, 20).fill(COLORS.primary);
    doc.fillColor("#FFFFFF").font("Helvetica").fontSize(10).text(data.periodLabel.toUpperCase(), left + 24, 68);
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(26).text(data.missionLabel, left + 24, 88, {
        width: pageWidth - 48,
    });
    doc.fillColor("#E0E7FF").font("Helvetica").fontSize(11).text(`${data.clientName} • Genere le ${data.generatedDate}`, left + 24, 124);
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(36).text(String(data.meetingsBooked), left + 24, 148);
    doc.fillColor("#E0E7FF").font("Helvetica").fontSize(11).text("RDV planifies", left + 92, 161);

    if (data.meetingsDelta != null) {
        doc.fillColor("#C7D2FE")
            .font("Helvetica-Bold")
            .fontSize(10)
            .text(`${formatDelta(data.meetingsDelta) ?? ""} vs periode precedente`, left + pageWidth - 196, 154, {
                width: 172,
                align: "right",
            });
    }

    doc.y = 198;
    drawSectionTitle(doc, "Vue d'ensemble");

    const gap = 12;
    const cardWidth = (pageWidth - gap) / 2;
    const cardHeight = 84;
    const cardsY = doc.y;

    drawStatCard(doc, left, cardsY, cardWidth, cardHeight, "Contacts touches", String(data.contactsReached), formatDelta(data.deltas?.[0]));
    drawStatCard(doc, left + cardWidth + gap, cardsY, cardWidth, cardHeight, "Leads qualifies", String(data.qualifiedLeads), formatDelta(data.deltas?.[1]));
    drawStatCard(doc, left, cardsY + cardHeight + gap, cardWidth, cardHeight, "Opportunites", String(data.opportunities), null);
    drawStatCard(
        doc,
        left + cardWidth + gap,
        cardsY + cardHeight + gap,
        cardWidth,
        cardHeight,
        "Taux de conversion",
        `${data.conversionRate}%`,
        formatDelta(data.deltas?.[3], " pts")
    );

    doc.y = cardsY + cardHeight * 2 + gap + 24;
    ensureSpace(doc, 120);
    drawSectionTitle(doc, "Points cles");

    const insights = buildInsights(data);
    for (const insight of insights) {
        ensureSpace(doc, 28);
        const bulletY = doc.y + 3;
        doc.circle(left + 4, bulletY + 4, 2.5).fill(COLORS.primary);
        doc.fillColor(COLORS.text).font("Helvetica").fontSize(10.5).text(insight, left + 16, doc.y, {
            width: pageWidth - 16,
            lineGap: 2,
        });
        doc.moveDown(0.7);
    }

    ensureSpace(doc, 160);
    drawSectionTitle(doc, "Evolution des RDV");
    drawTrendRows(doc, data.meetingsByPeriod);
    doc.moveDown(0.4);

    ensureSpace(doc, 80);
    drawSectionTitle(doc, "Missions");
    if (data.missions.length === 0) {
        doc.fillColor(COLORS.muted).font("Helvetica").fontSize(10).text("Aucune mission sur la periode selectionnee.");
    } else {
        for (const mission of data.missions) {
            drawMissionCard(doc, mission);
        }
    }

    doc.fillColor(COLORS.muted)
        .font("Helvetica")
        .fontSize(8)
        .text("Document genere sans rendu Chrome pour un export plus rapide et plus fiable.", left, doc.page.height - 28, {
            width: pageWidth,
            align: "center",
        });

    doc.end();
    return bufferPromise;
}
