# Claude Prompt: 3-Month Deep SDR Calls, Missions, and Execution Analysis PDF

You are Claude acting as a senior revenue operations analyst, SDR performance auditor, and B2B outbound strategy consultant. Your task is to create a polished, executive-ready PDF report from Supabase CSV exports covering the last 3 months of SDR activity.

The report must be in French, direct, evidence-based, and highly actionable. It should answer the real business question:

> Les SDR ont-ils vraiment travaille sur les missions ? Si oui, ou exactement ? Si non, ou sont les vrais problemes ? Est-ce un probleme d'effort, de planning, de qualite des listes, de script, de CRM tracking, ou de transformation commerciale ?

## Period

Analyze the period from 2026-02-26 to 2026-05-26 inclusive.

Use exact dates in the report. Do not say "last 3 months" without also naming the date range.

## Data Files To Use

The user will attach these CSVs. Treat them as authoritative evidence.

1. Q1 schema check:
   `Supabase Snippet Untitled query 661 (7).csv`
   Columns: table_name, column_name, data_type, udt_name

2. Q2 mission executive summary:
   `Supabase Snippet Untitled query 457 (4).csv`
   Columns include: mission_name, mission_status, assigned_sdrs, companies, contacts, callable_contacts, scheduled_blocks, total_actions, call_actions, meetings_booked, callbacks, interested, bad_contact_results, blocked_or_no_answer, meeting_rate_pct, last_action_at

3. Q3 SDR real work scoreboard:
   `Supabase Snippet Untitled query 938.csv`
   Columns include: sdr_name, role, crm_active_days, crm_active_hours, action_days, missions_worked, total_actions, calls, meetings, callbacks, bad_contact, no_response, actions_per_active_hour, meetings_per_call_pct, avg_duration_seconds, last_action_at

4. Q4 SDR x mission planned vs actual:
   `Supabase Snippet Untitled query 696.csv`
   Columns include: sdr_name, mission_name, scheduled_blocks, scheduled_days, scheduled_hours, action_days, actions, calls, meetings, actions_per_scheduled_hour, diagnostic_flag, last_action_at

5. Q5 weekly trend by mission:
   `Supabase Snippet Untitled query 773.csv`
   Columns include: week_start, mission_name, actions, calls, active_sdrs, meetings, callbacks, bad_contact, meeting_rate_pct

6. Q6 result breakdown:
   `Supabase Snippet Untitled query 285.csv`
   Columns include: mission_name, sdr_name, result, count_result, pct_of_sdr_mission_actions

7. Q7 call quality and enrichment:
   `Supabase Snippet Untitled query 175.csv`
   Columns include: mission_name, sdr_name, calls, calls_without_duration, calls_under_20s, calls_20_59s, calls_60s_plus, avg_duration_seconds, weak_or_missing_notes, enriched_calls, enrichment_errors, calls_with_recording, calls_with_summary, calls_with_transcript

8. Q9 meetings, cancellations, confirmation quality:
   `Supabase Snippet Untitled query 266.csv`
   Columns include: mission_name, sdr_name, meetings_booked, meetings_cancelled, confirmed_meetings, pending_meetings, cancelled_after_booking, booked_without_meeting_date, meetings_with_rdv_fiche, client_feedback_count, positive_feedback, negative_feedback

9. Q10 raw qualitative evidence sample:
   `Supabase Snippet Untitled query 575.csv`
   Columns include: action_id, createdAt, sdr_name, mission_name, campaign_name, channel, result, duration, company_name, contact_name, contact_title, note_excerpt, call_summary_excerpt, has_transcript, callEnrichmentError, callbackDate, confirmation_status

Important missing evidence:
The Q8 list coverage and data quality export was not provided. You must explicitly mention this limitation. Do not invent list-level coverage, list exhaustion, list quality, or per-list diagnostics beyond what can be inferred indirectly from mission-level target counts, bad contact counts, no response counts, and raw action evidence.

## Known High-Level Facts From The Data

Use these as starting hypotheses, then verify them from the attached CSVs before finalizing.

- 25 missions appear in Q2.
- 25,578 total actions were logged.
- 25,466 actions were calls, meaning the period is almost entirely call-driven.
- 112 email actions were logged.
- 0 LinkedIn actions were logged.
- 213 meetings were booked.
- 28 callbacks were logged.
- Only 3 actions were marked as INTERESTED.
- 1,066 bad contact style outcomes were logged.
- 18,850 actions were blocked/no answer style outcomes.
- Total scheduled blocks: 700.
- Total scheduled days: 419.
- Total companies: 39,117.
- Total contacts: 41,189.
- Callable contacts: 27,774.

Meeting quality and follow-through:
- Q9 shows 213 booked meetings.
- 208 were confirmed.
- 5 became cancelled after booking.
- 14 booked meetings had no meeting date.
- 143 had an RDV fiche.
- 55 client feedback records exist.
- Feedback split visible in Q9: 13 positive, 13 negative. The rest are neutral/other/missing depending on schema values.

Call data quality:
- Q7 shows 25,466 calls.
- 25,385 calls have no duration.
- Only 81 calls have a duration value at all.
- 4 calls are under 20 seconds.
- 36 calls are 20-59 seconds.
- 41 calls are 60 seconds or more.
- 4,564 calls have weak or missing notes.
- 3,449 calls are enriched.
- 10,780 enrichment errors exist.
- 3,097 calls have recording URLs.
- 2,531 calls have summaries.
- 2,528 calls have transcripts.

Planning versus real work:
- Q4 diagnostic flags:
  - OK_OR_NEEDS_CONTEXT: 42 SDR-mission pairs, 17,110 actions, 17,066 calls, 88 meetings, 3,904.05 scheduled hours.
  - WORKED_WITHOUT_PLANNING: 40 pairs, 2,812 actions, 2,768 calls, 125 meetings, 0 scheduled hours.
  - HIGH_CALLS_NO_MEETINGS: 32 pairs, 5,656 actions, 5,632 calls, 0 meetings, 1,337 scheduled hours.
  - PLANNED_BUT_NO_ACTIONS: 14 pairs, 0 actions, 0 calls, 0 meetings, 305.98 scheduled hours.

This is a major diagnostic axis. The report must distinguish:
- People who worked but with no conversion.
- People who were planned but did not log action.
- People who generated meetings without planning records.
- People who logged lots of action but the CRM lacks duration/activity tracking.

## Key Mission Examples To Analyze

High-volume missions:

- ERA GROUP: 4,524 actions, 4,523 calls, 21 meetings, 6 callbacks, 116 bad contact results, 3,547 blocked/no answer, 0.46% meeting rate, 9 active SDRs, 6 assigned SDRs, 113 scheduled blocks, last action 2026-05-26.
- Elacin: 3,512 actions, 3,505 calls, 18 meetings, 117 bad contact, 2,839 blocked/no answer, 0.51% meeting rate, 11 active SDRs, 7 assigned SDRs, 95 scheduled blocks, last action 2026-05-15.
- UPIKA: 3,418 actions, 3,416 calls, 8 meetings, 172 bad contact, 2,708 blocked/no answer, 0.23% meeting rate, 12 active SDRs, 9 assigned SDRs, 77 scheduled blocks, last action 2026-05-22.
- MBWay: 2,575 actions, 2,544 calls, 10 meetings, 7 callbacks, 267 bad contact, 1,545 blocked/no answer, 0.39% meeting rate, 10 active SDRs, 10 assigned SDRs, 67 scheduled blocks, last action 2026-05-20.
- Mission Deltaplus Systems: 1,726 actions, 1,710 calls, 6 meetings, 1 callback, 13 bad contact, 1,396 blocked/no answer, 0.35% meeting rate, last action 2026-05-07.

Low or concerning meeting-rate missions with meaningful volume:

- MS FORMATION: 966 actions, 0 meetings, 82 bad contact, 780 blocked/no answer, 0.00% meeting rate.
- Mission Team Link: 1,459 actions, 1 meeting, 96 bad contact, 1,140 blocked/no answer, 0.07% meeting rate.
- Marron & Associes: 576 actions, 1 meeting, 28 bad contact, 379 blocked/no answer, 0.17% meeting rate.
- UPIKA: 3,418 actions, 8 meetings, 0.23% meeting rate.
- Mission Deltaplus Systems: 1,726 actions, 6 meetings, 0.35% meeting rate.
- MBWay: 2,575 actions, 10 meetings, 0.39% meeting rate.
- ERA GROUP: 4,524 actions, 21 meetings, 0.46% meeting rate.
- Elacin: 3,512 actions, 18 meetings, 0.51% meeting rate.

Better performing missions by meeting rate with meaningful volume:

- Arthurimmo.com: 1,269 actions, 21 meetings, 1.65% meeting rate.
- Tonic Radio: 1,388 actions, 16 meetings, 1.15% meeting rate.
- Wanted Design: 1,250 actions, 14 meetings, 1.12% meeting rate.
- Welcome Drinks: 624 actions, 7 meetings, 1.12% meeting rate.

The report must compare these groups. Do not just rank them. Explain likely causes: audience quality, timing, list freshness, pitch/offer, SDR fit, channel mix, and follow-up discipline.

## Key SDR Examples To Analyze

From Q3, high activity SDRs:

- David: 3,634 actions, 3,631 calls, 6 meetings, 1 callback, 92 bad contact, 3,090 no response, 51 action days, 7 missions, 0.17% meetings per call.
- Lea: 3,442 actions, 3,442 calls, 8 meetings, 5 callbacks, 100 bad contact, 2,883 no response, 51 action days, 8 missions, 0.23% meetings per call.
- Julien: 2,824 actions, 2,810 calls, 13 meetings, 7 callbacks, 130 bad contact, 1,968 no response, 47 action days, 9 missions, 0.46% meetings per call.
- Sonia: 2,202 actions, 2,202 calls, 4 meetings, 5 callbacks, 114 bad contact, 1,618 no response, 29 action days, 6 missions, 0.18% meetings per call.
- Kevin: 1,914 actions, 1,908 calls, 11 meetings, 0 callbacks, 81 bad contact, 1,485 no response, 50 action days, 9 missions, 0.58% meetings per call.
- Amelie: 1,759 actions, 1,749 calls, 6 meetings, 214 bad contact, 976 no response, 33 action days, 7 missions, 0.34% meetings per call.
- Anais: 1,568 actions, 1,560 calls, 10 meetings, 91 bad contact, 1,229 no response, 28 action days, 7 missions, 0.64% meetings per call.
- Maxime: 1,548 actions, 1,548 calls, 7 meetings, 7 callbacks, 22 bad contact, 1,087 no response, 24 action days, 3 missions, 0.45% meetings per call.
- Morgane: 1,247 actions, 1,244 calls, 10 meetings, 53 bad contact, 828 no response, 46 action days, 6 missions, 0.80% meetings per call.

Best conversion among SDRs with at least 500 calls:

- Morgane: 1,244 calls, 10 meetings, 0.80%.
- Anais: 1,560 calls, 10 meetings, 0.64%.
- Kevin: 1,908 calls, 11 meetings, 0.58%.
- Alain: 1,048 calls, 6 meetings, 0.57%.
- Julien: 2,810 calls, 13 meetings, 0.46%.

Worst conversion among high-volume SDRs:

- David: 3,631 calls, 6 meetings, 0.17%.
- Sonia: 2,202 calls, 4 meetings, 0.18%.
- Lea: 3,442 calls, 8 meetings, 0.23%.

Important caveat:
Q3 shows crm_active_days and crm_active_hours are 0 or null for nearly all SDRs. Do not conclude the SDRs were not connected solely from CRM active hours. Instead, conclude that the CRM activity tracking table appears unusable or not populated for this period, while action logs show actual work. This is a systems/data-quality issue.

## Planning Anomalies To Highlight

Planned but no actions:

- Lea on Wanted Design: 80 scheduled hours, 0 actions.
- Mathieu on Arthurimmo.com: 80 scheduled hours, 0 actions.
- ZtestBookeur on UPIKA: 32 scheduled hours, 0 actions.
- Amelie on ZENIOO: 24 scheduled hours, 0 actions.
- Maxime on Marron & Associes: 16 scheduled hours, 0 actions.

High calls but no meetings:

- Anais on MS FORMATION: 724 calls, 0 meetings, 48 scheduled hours.
- Julien on Mission Deltaplus Systems: 575 calls, 0 meetings, 97 scheduled hours.
- David on Mission Deltaplus Systems: 526 calls, 0 meetings, 48 scheduled hours.
- Sonia on UPIKA: 474 calls, 0 meetings, 56 scheduled hours.
- Rayan on UPIKA: 425 calls, 0 meetings, 40 scheduled hours.
- Kevin on UPIKA: 299 calls, 0 meetings, 78 scheduled hours.
- Amelie on Marron & Associes: 267 calls, 0 meetings, 24 scheduled hours.

Worked without planning:

- Jean-Francois on Elacin: 580 actions, 4 meetings, 0 scheduled hours.
- Jean-Francois on Arthurimmo.com: 427 actions, 5 meetings, 0 scheduled hours.
- Jean-Francois on UPIKA: 291 actions, 2 meetings, 0 scheduled hours.
- Sophie on Mission Team Link: 267 actions, 0 meetings, 0 scheduled hours.
- Jean-Francois on Wanted Design: 251 actions, 1 meeting, 0 scheduled hours.
- Jean-Francois on ERA GROUP: 177 actions, 7 meetings, 0 scheduled hours.
- Sophie on Cuisaline: 50 actions, 50 meetings, 0 scheduled hours. Treat this as a likely data anomaly or imported meeting flow until verified, not normal outbound call performance.

The report must include a section titled "Planning vs execution: le vrai ecart" and explain that planning records and action records are not aligned. This means management cannot reliably judge productivity from planning alone.

## Weekly Trend To Discuss

Weekly totals across Q5:

- Week of 2026-02-23: 328 actions, 2 meetings.
- Week of 2026-03-02: 2,158 actions, 4 meetings.
- Week of 2026-03-09: 1,743 actions, 4 meetings.
- Week of 2026-03-16: 2,033 actions, 9 meetings.
- Week of 2026-03-23: 2,866 actions, 54 meetings.
- Week of 2026-03-30: 2,174 actions, 14 meetings, 28 callbacks.
- Week of 2026-04-06: 2,005 actions, 18 meetings.
- Week of 2026-04-13: 2,185 actions, 23 meetings.
- Week of 2026-04-20: 2,734 actions, 20 meetings.
- Week of 2026-04-27: 2,581 actions, 25 meetings.
- Week of 2026-05-04: 1,985 actions, 11 meetings.
- Week of 2026-05-11: 1,415 actions, 12 meetings.
- Week of 2026-05-18: 1,040 actions, 17 meetings.
- Week of 2026-05-25: 331 actions, 0 meetings. This is a partial week because the period ends on 2026-05-26.

Analyze the spike in meetings during the week of 2026-03-23 and the volume decline in May. Do not assume causality. Suggest possible explanations and what should be checked.

## Result Distribution To Use

Q6 aggregate result totals:

- NO_RESPONSE: 18,545.
- REFUS: 2,409.
- RAPPEL: 1,529.
- FAUX_NUMERO: 964.
- HORS_CIBLE: 726.
- MAIL_UNIQUEMENT: 532.
- MEETING_BOOKED: 213.
- BARRAGE_SECRETAIRE: 155.
- GERE_PAR_SIEGE: 150.
- MAUVAIS_INTERLOCUTEUR: 96.

This distribution is central. The report should say that the operating reality is not "many conversations converted poorly", but rather "a very high volume of unreachable/no-response outcomes, plus moderate refusal, with limited positive pipeline creation."

## Report Requirements

Create a PDF-ready report with the following structure:

1. Cover page
   - Title: "Analyse SDR, appels et missions"
   - Subtitle: "Audit profond du 26 fevrier 2026 au 26 mai 2026"
   - Date of report generation

2. Executive summary
   - 8 to 12 bullet points maximum.
   - Include the clearest answer to: were SDRs really working or not?
   - Separate "work was logged" from "work converted".
   - Mention data reliability problems.

3. Methodology and data limits
   - Explain the CSV sources.
   - Explain that actions are the strongest evidence of work.
   - Explain why CRM active hours are unreliable.
   - Explain that Q8/list-level coverage is missing.
   - Explain that call duration is mostly missing, so call quality cannot be judged from duration alone.

4. Global funnel
   - Total actions, calls, emails, LinkedIn.
   - Meetings, callbacks, interest, bad contact, no response/blocked.
   - Conversion rates:
     - meetings / total actions
     - meetings / calls
     - no response / total actions
     - bad contact / total actions
   - Interpret the funnel in plain language.

5. Mission-level performance
   - Table of all missions or at least top 15.
   - Separate:
     - high activity/high output
     - high activity/low output
     - low activity
     - stalled or last-action-old missions
   - Include deep commentary on ERA GROUP, Elacin, UPIKA, MBWay, Deltaplus, MS FORMATION, Mission Team Link, Arthurimmo.com, Tonic Radio, Wanted Design.

6. SDR-level performance
   - Rank SDRs by volume and by conversion.
   - Do not shame. Use operational diagnosis language.
   - Identify:
     - high-volume low-conversion profiles
     - lower-volume better-conversion profiles
     - SDRs spread over too many missions
     - SDRs with high bad-contact or no-response profiles
   - Provide coaching recommendations by SDR segment.

7. Planning vs execution
   - Use Q4 diagnostic flags.
   - Include tables for:
     - planned but no actions
     - high calls no meetings
     - worked without planning
   - Explain management implications.
   - Recommend operational controls.

8. Call quality and CRM evidence quality
   - Discuss missing durations, weak notes, call enrichment errors.
   - Separate "SDR performance issue" from "tooling/tracking issue".
   - Explain that 25,385 of 25,466 calls without duration means the system cannot fully audit talk time.
   - Explain what data should be fixed before the next monthly report.

9. Meeting quality
   - Use Q9.
   - Confirmed meetings, cancellations, missing dates, RDV fiche coverage, feedback.
   - Mention that 143 of 213 meetings have RDV fiche.
   - Mention 14 booked meetings without meeting date.
   - Mention client feedback is only 55 records, so feedback-based quality is partial.

10. Weekly dynamics
    - Show action and meeting trend by week.
    - Discuss March 23 spike.
    - Discuss May volume decline.
    - Mark week of 2026-05-25 as partial.

11. Root cause diagnosis
    Organize root causes into:
    - Effort and attendance
    - Planning discipline
    - List/data quality
    - Reachability problem
    - Pitch/script/offer problem
    - CRM/tooling/tracking problem
    - Meeting qualification/follow-through problem

    For each root cause, give:
    - Evidence
    - Severity
    - Confidence level
    - What to verify next
    - Recommended action

12. Recommendations
    Provide:
    - Immediate actions for next 7 days
    - 30-day operating plan
    - 90-day transformation plan
    - Metrics to track weekly
    - Manager rituals: daily standup, mission review, SDR coaching, list QA, call QA.

13. Appendices
    - Data dictionary
    - Metric formulas
    - Tables of anomalies
    - Caveats and missing data

## Visual Requirements

The PDF should include:

- KPI tiles for actions, calls, meetings, conversion rate, no-response rate, bad-contact rate.
- Bar chart: actions by mission.
- Bar chart: meetings by mission.
- Scatter plot or bubble chart: mission actions vs meeting rate.
- SDR leaderboard: volume and conversion.
- Weekly line chart: actions and meetings.
- Diagnostic table: planned but no actions.
- Diagnostic table: high calls no meetings.
- Data quality scorecard: duration missing, note quality, enrichment errors, RDV fiche coverage.

If you cannot create actual charts, create clear chart-ready tables and describe the chart placement.

## Interpretation Rules

Be rigorous:

- Do not say "SDRs did not work" if actions exist. Say "work was logged, but conversion was weak" unless a planning/no-action anomaly specifically supports non-execution.
- Do not treat CRM active hours as proof of inactivity because the table appears unpopulated.
- Do not treat calls without duration as fake calls. Treat them as a tracking/integration gap.
- Do not over-credit raw action volume. High volume with 0 meetings is not successful execution.
- Do not over-penalize an SDR without considering mission/list difficulty.
- Do not invent missing list-level coverage because Q8 is absent.
- Mention data anomalies, especially Sophie on Cuisaline with 50 actions and 50 meetings without planning.
- When confidence is low, say so.

## Tone

Use a direct but professional tone. The report should be useful for a founder/manager who needs to decide what to fix.

Avoid vague language. Prefer:

- "Les donnees montrent..."
- "Le probleme le plus probable est..."
- "Ce point doit etre verifie car..."
- "Ce n'est pas une preuve de non-travail, mais..."
- "Le risque operationnel est..."

## Final Deliverable

Produce a PDF-ready report in French. If generating HTML first, make it print-ready with clean sections, tables, and page breaks. The final report should be long and detailed, roughly 15 to 25 pages if exported to PDF.

Also include a 1-page executive summary at the beginning that can be read alone.

