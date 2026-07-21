import type { CSSProperties } from 'react';
import {
  LayoutGrid, Map, Activity, Workflow, BarChart3, Bot, FileText, Plug, Settings,
  Radio, AlertTriangle, SlidersHorizontal, Landmark, Package, FileWarning, Radar,
  Sparkles, ListOrdered, GitBranch, Calculator, Layers, ListChecks, ShieldAlert,
  Users, CalendarClock, Ruler, Banknote, Images, ClipboardCheck, Link2, Building2,
  HeartPulse, Wrench, Target, FolderOpen, AlertOctagon, Terminal, Database,
  BadgeCheck, DollarSign, Briefcase, HardHat, ShieldCheck, Sprout, Gauge,
  Search, Bell, CheckSquare, User, ChevronDown, ChevronRight, ChevronLeft,
  Menu, X, CheckCircle2, Clock, Circle, Lock, TrendingUp, TrendingDown,
  Droplets, Wind, Camera, Video, FileCheck, MapPin, Filter, Download, Share2,
  Play, Pause, RotateCcw, Plus, ArrowUpRight, ArrowRight, ExternalLink, Eye,
  Zap, PackageCheck, Send, Loader2, MessageSquareText, RefreshCw, MapPinned,
  ThumbsUp, PauseCircle, Waves, ChevronsUpDown, PanelRightClose, PanelRightOpen,
  Info, Route, FastForward, Building, HelpCircle, ScanLine, FileSearch, type LucideIcon,
} from 'lucide-react';

export const ICONS: Record<string, LucideIcon> = {
  LayoutGrid, Map, Activity, Workflow, BarChart3, Bot, FileText, Plug, Settings,
  Radio, AlertTriangle, SlidersHorizontal, Landmark, Package, FileWarning, Radar,
  Sparkles, ListOrdered, GitBranch, Calculator, Layers, ListChecks, ShieldAlert,
  Users, CalendarClock, Ruler, Banknote, Images, ClipboardCheck, Link2, Building2,
  HeartPulse, Wrench, Target, FolderOpen, AlertOctagon, Terminal, Database,
  BadgeCheck, DollarSign, Briefcase, HardHat, ShieldCheck, Sprout, Gauge,
  Search, Bell, CheckSquare, User, ChevronDown, ChevronRight, ChevronLeft,
  Menu, X, CheckCircle2, Clock, Circle, Lock, TrendingUp, TrendingDown,
  Droplets, Wind, Camera, Video, FileCheck, MapPin, Filter, Download, Share2,
  Play, Pause, RotateCcw, Plus, ArrowUpRight, ArrowRight, ExternalLink, Eye,
  Zap, PackageCheck, Send, Loader2, MessageSquareText, RefreshCw, MapPinned,
  ThumbsUp, PauseCircle, Waves, ChevronsUpDown, PanelRightClose, PanelRightOpen,
  Info, Route, FastForward, Building, HelpCircle, ScanLine, FileSearch,
};

export function Icon({
  name, size = 16, className, strokeWidth, style,
}: { name: string; size?: number; className?: string; strokeWidth?: number; style?: CSSProperties }) {
  const Cmp = ICONS[name] || HelpCircle;
  return <Cmp size={size} className={className} strokeWidth={strokeWidth} style={style} />;
}
