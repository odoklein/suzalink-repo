import {
  LayoutDashboard,
  Building2,
  Target,
  FileText,
  LayoutGrid,
  List,
  BarChart3,
  Users,
  FolderKanban,
  Calendar,
  CalendarDays,
  CalendarClock,
  Phone,
  Briefcase,
  Settings,
  UserPlus,
  Mail,
  Inbox,
  Send,
  Zap,
  MessageSquare,
  Receipt,
  Search,
  History,
  HelpCircle,
  LucideIcon,
  Database,
  FileDown,
  Activity,
  Key,
  Brain,
  Clock,
  BookOpen,
} from "lucide-react";
import { UserRole } from "@prisma/client";

// ============================================
// NAVIGATION ITEM TYPES
// ============================================

export interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  permission?: string;
  roles?: UserRole[];
  badge?: string;
  badgeDetail?: string;
  children?: NavItem[];
  openInNewTab?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
  dividerBefore?: boolean;
}

// ============================================
// MANAGER NAVIGATION
// ============================================

export const MANAGER_NAV: NavSection[] = [
  {
    items: [
      {
        href: "/manager/dashboard",
        icon: LayoutDashboard,
        label: "Tableau de bord",
        permission: "pages.dashboard",
      },
    ],
  },
  {
    title: "Prospection",
    items: [
      {
        href: "/manager/missions",
        icon: Target,
        label: "Missions",
        permission: "pages.missions",
      },
      {
        href: "/manager/lists",
        icon: Database,
        label: "Listes",
        permission: "pages.prospects",
      },
      {
        href: "/manager/prospection",
        icon: Activity,
        label: "Suivi des appels",
        permission: "pages.missions",
      },
    ],
  },
  {
    title: "Résultats",
    items: [
      {
        href: "/manager/clients",
        icon: Building2,
        label: "Clients",
        permission: "pages.clients",
      },
      {
        href: "/manager/rdv",
        icon: CalendarClock,
        label: "Rendez-vous",
        permission: "pages.analytics",
      },
      {
        href: "/manager/analytics",
        icon: BarChart3,
        label: "Statistiques",
        permission: "pages.analytics",
      },
      {
        href: "/manager/analyse-ia",
        icon: Brain,
        label: "Analyse IA",
        permission: "pages.analytics",
      },
    ],
  },
  {
    title: "Équipe",
    items: [
      {
        href: "/manager/utilisateurs",
        icon: Users,
        label: "Collaborateurs",
        permission: "pages.sdrs",
      },
      {
        href: "/manager/planning",
        icon: CalendarDays,
        label: "Planning",
        permission: "pages.planning",
      },
      {
        href: "/manager/projects",
        icon: FolderKanban,
        label: "Projets",
        permission: "pages.projects",
      },
      {
        href: "/manager/sdr-feedback",
        icon: MessageSquare,
        label: "Avis équipe",
        permission: "pages.sdrs",
      },
    ],
  },
  {
    title: "",
    dividerBefore: true,
    items: [
      {
        href: "/manager/emails",
        icon: Mail,
        label: "Email Hub",
        permission: "pages.email",
      },
      {
        href: "/manager/files",
        icon: FileText,
        label: "Fichiers",
        permission: "pages.files",
      },
      {
        href: "/manager/settings",
        icon: Settings,
        label: "Paramètres",
        permission: "pages.sdrs",
      },
      {
        href: "/manager/billing",
        icon: Receipt,
        label: "Facturation",
        permission: "pages.billing",
      },
      {
        href: "/manager/api",
        icon: Key,
        label: "API & Intégrations",
        permission: "pages.sdrs",
      },
    ],
  },
];

// ============================================
// SDR NAVIGATION
// ============================================

export const SDR_NAV: NavSection[] = [
  {
    items: [
      {
        href: "/sdr",
        icon: LayoutDashboard,
        label: "Accueil",
        permission: "pages.dashboard",
      },
    ],
  },
  {
    title: "Mon travail",
    items: [
      {
        href: "/sdr/action",
        icon: Phone,
        label: "Appeler",
        permission: "pages.action",
      },
      {
        href: "/sdr/callbacks",
        icon: CalendarClock,
        label: "Rappels",
        permission: "pages.action",
      },
    ],
  },
  {
    title: "Résultats",
    items: [
      {
        href: "/sdr/meetings",
        icon: Briefcase,
        label: "Mes RDV",
        permission: "pages.opportunities",
      },
      {
        href: "/sdr/history",
        icon: History,
        label: "Historique",
        permission: "pages.action",
      },
      {
        href: "/sdr/calendar",
        icon: CalendarDays,
        label: "Calendrier",
        permission: "pages.action",
      },
    ],
  },
  {
    title: "Organisation",
    items: [
      {
        href: "/sdr/emails",
        icon: Mail,
        label: "Email Hub",
        permission: "pages.email",
      },
      {
        href: "/sdr/projects",
        icon: FolderKanban,
        label: "Projets",
        permission: "pages.projects",
      },
      {
        href: "/sdr/planning",
        icon: CalendarDays,
        label: "Planning",
        permission: "pages.planning",
      },
    ],
  },
];

// ============================================
// BOOKER NAVIGATION
// ============================================

export const BOOKER_NAV: NavSection[] = [
  {
    items: [
      {
        href: "/sdr",
        icon: LayoutDashboard,
        label: "Accueil",
        permission: "pages.dashboard",
      },
    ],
  },
  {
    title: "Mes appels",
    items: [
      {
        href: "/sdr/lists",
        icon: Database,
        label: "Listes",
        permission: "pages.action",
      },
      {
        href: "/sdr/action",
        icon: Phone,
        label: "Appeler",
        permission: "pages.action",
      },
    ],
  },
  {
    title: "Mon suivi",
    items: [
      {
        href: "/sdr/callbacks",
        icon: CalendarClock,
        label: "Rappels",
        permission: "pages.action",
      },
      {
        href: "/sdr/history",
        icon: History,
        label: "Historique",
        permission: "pages.action",
      },
      {
        href: "/sdr/meetings",
        icon: Briefcase,
        label: "Mes RDV",
        permission: "pages.opportunities",
      },
    ],
  },
];

// ============================================
// BUSINESS DEVELOPER NAVIGATION
// ============================================

export const BD_NAV: NavSection[] = [
  {
    items: [
      {
        href: "/bd/dashboard",
        icon: LayoutDashboard,
        label: "Accueil",
        permission: "pages.dashboard",
      },
    ],
  },
  {
    title: "Portefeuille",
    items: [
      {
        href: "/bd/clients",
        icon: Building2,
        label: "Mes clients",
        permission: "pages.portfolio",
      },
      {
        href: "/bd/missions",
        icon: Target,
        label: "Missions",
        permission: "pages.missions",
      },
      {
        href: "/sdr/opportunities",
        icon: Briefcase,
        label: "Opportunités",
        permission: "pages.opportunities",
      },
      {
        href: "/bd/clients/new",
        icon: UserPlus,
        label: "Nouveau client",
        permission: "pages.onboarding",
      },
    ],
  },
  {
    title: "Actions",
    items: [
      {
        href: "/sdr/action",
        icon: Phone,
        label: "Appeler",
        permission: "pages.action",
      },
      {
        href: "/sdr/callbacks",
        icon: CalendarClock,
        label: "Rappels",
        permission: "pages.action",
      },
      {
        href: "/sdr/history",
        icon: History,
        label: "Historique",
        permission: "pages.action",
      },
    ],
  },
  {
    title: "Compte",
    items: [
      {
        href: "/bd/settings",
        icon: Settings,
        label: "Mon profil",
        permission: "pages.settings",
      },
    ],
  },
];

// ============================================
// DEVELOPER NAVIGATION
// ============================================

export const DEVELOPER_NAV: NavSection[] = [
  {
    items: [
      {
        href: "/developer/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
        permission: "pages.dashboard",
      },
    ],
  },
  {
    title: "Travail",
    items: [
      {
        href: "/developer/projects",
        icon: FolderKanban,
        label: "Projets",
        permission: "pages.projects",
      },
      {
        href: "/developer/tasks",
        icon: List,
        label: "Tâches",
        permission: "pages.projects",
      },
    ],
  },
  {
    title: "Compte",
    items: [
      {
        href: "/developer/integrations",
        icon: Key,
        label: "Intégrations",
        permission: "pages.settings",
      },
      {
        href: "/developer/settings",
        icon: Settings,
        label: "Paramètres",
        permission: "pages.settings",
      },
    ],
  },
];

// ============================================
// CLIENT NAVIGATION
// ============================================

export const CLIENT_NAV: NavSection[] = [
  {
    items: [
      {
        href: "/client/portal",
        icon: LayoutDashboard,
        label: "Accueil",
        permission: "pages.dashboard",
      },
    ],
  },
  {
    title: "Mon suivi",
    items: [
      {
        href: "/client/portal/meetings",
        icon: CalendarClock,
        label: "Mes RDV",
        permission: "pages.dashboard",
      },
      {
        href: "/client/portal/reporting",
        icon: BarChart3,
        label: "Rapports",
        permission: "pages.dashboard",
      },
      {
        href: "/client/portal/activite",
        icon: Activity,
        label: "Activité",
        permission: "pages.dashboard",
      },
    ],
  },
  {
    title: "Ressources",
    items: [
      {
        href: "/client/portal/email",
        icon: Mail,
        label: "Email",
        permission: "pages.dashboard",
      },
      {
        href: "/client/portal/database",
        icon: Database,
        label: "Contacts",
        permission: "pages.dashboard",
      },
      {
        href: "/client/portal/files",
        icon: FileText,
        label: "Fichiers",
        permission: "pages.dashboard",
      },
      {
        href: "/client/portal/sales-playbook",
        icon: BookOpen,
        label: "Argumentaire",
        permission: "pages.dashboard",
      },
    ],
  },
  {
    title: "Compte",
    items: [
      {
        href: "/client/portal/settings",
        icon: Settings,
        label: "Paramètres",
        permission: "pages.dashboard",
      },
      {
        href: "/client/portal/aide",
        icon: HelpCircle,
        label: "Aide",
        permission: "pages.dashboard",
      },
    ],
  },
];

// ============================================
// COMMERCIAL NAVIGATION
// ============================================

export const COMMERCIAL_NAV: NavSection[] = [
  {
    items: [
      {
        href: "/commercial/portal",
        icon: LayoutDashboard,
        label: "Accueil",
      },
    ],
  },
  {
    title: "Suivi",
    items: [
      {
        href: "/commercial/portal/meetings",
        icon: CalendarClock,
        label: "Mes RDV",
      },
      {
        href: "/commercial/portal/contacts",
        icon: Users,
        label: "Contacts",
      },
    ],
  },
  {
    title: "Compte",
    items: [
      {
        href: "/commercial/portal/settings",
        icon: Settings,
        label: "Paramètres",
      },
    ],
  },
];

// ============================================
// GET NAVIGATION BY ROLE
// ============================================

export function getNavByRole(role: UserRole): NavSection[] {
  switch (role) {
    case "MANAGER":
      return MANAGER_NAV;
    case "SDR":
      return SDR_NAV;
    case "BOOKER":
      return BOOKER_NAV;
    case "BUSINESS_DEVELOPER":
      return BD_NAV;
    case "DEVELOPER":
      return DEVELOPER_NAV;
    case "CLIENT":
      return CLIENT_NAV;
    case "COMMERCIAL":
      return COMMERCIAL_NAV;
    default:
      return [];
  }
}

// ============================================
// ROLE DISPLAY CONFIG
// ============================================

export interface RoleConfig {
  label: string;
  color: string;
  gradient: string;
  defaultPath: string;
}

export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  MANAGER: {
    label: "Manager",
    color: "amber",
    gradient: "from-[#0c3b38] to-[#25745f]",
    defaultPath: "/manager/dashboard",
  },
  SDR: {
    label: "Sales",
    color: "amber",
    gradient: "from-[#0c3b38] to-[#25745f]",
    defaultPath: "/sdr/action",
  },
  BOOKER: {
    label: "Booker",
    color: "amber",
    gradient: "from-[#0c3b38] to-[#25745f]",
    defaultPath: "/sdr/action",
  },
  BUSINESS_DEVELOPER: {
    label: "BD",
    color: "emerald",
    gradient: "from-[#25745f] to-[#0c3b38]",
    defaultPath: "/bd/dashboard",
  },
  DEVELOPER: {
    label: "Dev",
    color: "amber",
    gradient: "from-[#ff9e1b] to-[#e07c00]",
    defaultPath: "/developer/dashboard",
  },
  CLIENT: {
    label: "Client",
    color: "amber",
    gradient: "from-[#0c3b38] to-[#25745f]",
    defaultPath: "/client/portal",
  },
  COMMERCIAL: {
    label: "Commercial",
    color: "emerald",
    gradient: "from-[#25745f] to-[#0c3b38]",
    defaultPath: "/commercial/portal",
  },
};
