// Roster persistence shared by /tools/student-picker and /tools/seating-chart
// — factored out of studentPicker.ts so the seating chart can read/write the
// exact same rosters (same localStorage keys/schema) without duplicating the
// roster-entry UI or storage logic. studentPicker.ts re-exports everything
// here for backwards compatibility with its existing imports.

export interface Student {
	name: string;
	/** Temporarily excluded from picks/groups/pairs without removing them
	 *  from the roster — a sick or pulled-out-of-class student, say. */
	absent: boolean;
}

export interface Roster {
	name: string;
	students: Student[];
}

const ROSTERS_KEY = "logicdash-student-picker-rosters";
const ACTIVE_ROSTER_KEY = "logicdash-student-picker-active";

/** All saved rosters, keyed by name. Corrupt/missing storage just yields no
 *  saved rosters rather than throwing — this is a convenience feature, not
 *  something that should ever break the page. */
export function loadRosters(): Record<string, Roster> {
	try {
		const raw = localStorage.getItem(ROSTERS_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw);
		return typeof parsed === "object" && parsed !== null ? parsed : {};
	} catch {
		return {};
	}
}

export function saveRoster(roster: Roster): void {
	try {
		const all = loadRosters();
		all[roster.name] = roster;
		localStorage.setItem(ROSTERS_KEY, JSON.stringify(all));
	} catch {
		// Storage full/unavailable (private browsing, quota, etc.) — the
		// roster still works for the rest of this session, it just won't
		// survive a reload. Not worth surfacing an error for a convenience
		// feature on a classroom tool.
	}
}

export function deleteRoster(name: string): void {
	try {
		const all = loadRosters();
		delete all[name];
		localStorage.setItem(ROSTERS_KEY, JSON.stringify(all));
	} catch {
		// See saveRoster().
	}
}

export function loadActiveRosterName(): string | null {
	try {
		return localStorage.getItem(ACTIVE_ROSTER_KEY);
	} catch {
		return null;
	}
}

export function saveActiveRosterName(name: string): void {
	try {
		localStorage.setItem(ACTIVE_ROSTER_KEY, name);
	} catch {
		// See saveRoster().
	}
}
