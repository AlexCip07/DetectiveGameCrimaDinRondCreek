/**
 * Photo Action Checker
 * Verifică dacă există photo actions pentru user și execută acțiuni pentru cele cu done = false
 */

export interface PhotoAction {
	action_id: number;
	user_id: number;
	action: number;
	done: boolean;
}

export interface PhotoActionCheckResult {
	hasActions: boolean;
	pendingActions: PhotoAction[];
	completedActions: PhotoAction[];
	allCompleted: boolean;
}

/**
 * Verifică photo actions pentru user-ul curent
 * @returns Rezultatul verificării cu acțiunile pending și completate
 */
export async function checkPhotoActions(): Promise<PhotoActionCheckResult> {
	try {
		const res = await fetch('/api/photo-actions');
		
		if (!res.ok) {
			console.error('Failed to fetch photo actions:', res.statusText);
			return {
				hasActions: false,
				pendingActions: [],
				completedActions: [],
				allCompleted: true
			};
		}
		
		const data = await res.json();
		const actions: PhotoAction[] = data.actions || [];
		
		const pendingActions = actions.filter(a => !a.done);
		const completedActions = actions.filter(a => a.done);
		
		return {
			hasActions: actions.length > 0,
			pendingActions,
			completedActions,
			allCompleted: pendingActions.length === 0
		};
	} catch (error) {
		console.error('Error checking photo actions:', error);
		return {
			hasActions: false,
			pendingActions: [],
			completedActions: [],
			allCompleted: true
		};
	}
}

/**
 * Execută o acțiune bazată pe numărul acțiunii pending
 * Personalizează această funcție pentru a adăuga logica ta
 */
export async function executePendingAction(action: PhotoAction): Promise<void> {
	console.log(`Executing pending action ${action.action} (ID: ${action.action_id}) for user ${action.user_id}`);
	
	// Adaugă logica ta aici bazată pe action.action (număr)
	switch (action.action) {
		case 1:
			console.log('Handling action 1...');
			break;
		case 2:
			console.log('Handling action 2...');
			break;
		case 3:
			console.log('Handling action 3...');
			break;
		default:
			console.log(`Handling action: ${action.action}...`);
	}
}

/**
 * Handler principal care verifică și execută toate acțiunile pending
 * @param onPendingFound - Callback executat când sunt găsite acțiuni pending
 */
export async function handlePhotoActionsOnLoad(
	onPendingFound?: (pendingActions: PhotoAction[]) => void
): Promise<PhotoActionCheckResult> {
	const result = await checkPhotoActions();
	
	if (!result.allCompleted && result.pendingActions.length > 0) {
		console.log(`Found ${result.pendingActions.length} pending photo action(s)`);
		
		// Execută callback-ul dacă este furnizat
		if (onPendingFound) {
			onPendingFound(result.pendingActions);
		}
		
		// Execută fiecare acțiune pending
		for (const action of result.pendingActions) {
			await executePendingAction(action);
		}
	}
	
	return result;
}

/**
 * Marchează o acțiune ca fiind completată (prin număr)
 */
export async function markActionComplete(actionNumber: number): Promise<boolean> {
	try {
		const res = await fetch('/api/photo-actions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action: actionNumber, done: true })
		});
		
		return res.ok;
	} catch (error) {
		console.error('Error marking action complete:', error);
		return false;
	}
}

/**
 * Creează o nouă acțiune (done = false implicit)
 */
export async function createAction(actionNumber: number): Promise<boolean> {
	try {
		const res = await fetch('/api/photo-actions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action: actionNumber, done: false })
		});
		
		return res.ok;
	} catch (error) {
		console.error('Error creating action:', error);
		return false;
	}
}
