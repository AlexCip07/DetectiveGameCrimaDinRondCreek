<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	let { data, form } = $props();

	let sqlQuery = $state('');
	let queryResult = $state<{ columns: string[]; rows: unknown[] } | null>(null);
	let showInsertModal = $state(false);
	let insertData = $state<Record<string, string>>({});
	let editingRow = $state<Record<string, unknown> | null>(null);
	let editData = $state<Record<string, string>>({});

	function getIdColumn(tableName: string): string {
		const table = data.tables.find((t) => t.name === tableName);
		if (!table) return 'id';
		// Common primary key names
		const pkCandidates = ['id', 'username', 'name'];
		for (const pk of pkCandidates) {
			if (table.columns.some((c) => c.name === pk)) return pk;
		}
		return table.columns[0]?.name || 'id';
	}

	function openInsertModal() {
		if (!data.selectedTable) return;
		const table = data.tables.find((t) => t.name === data.selectedTable);
		if (!table) return;
		insertData = {};
		table.columns.forEach((col) => {
			insertData[col.name] = '';
		});
		showInsertModal = true;
	}

	function openEditModal(row: Record<string, unknown>) {
		editingRow = row;
		editData = {};
		Object.entries(row).forEach(([key, value]) => {
			editData[key] = String(value ?? '');
		});
	}

	function closeModals() {
		showInsertModal = false;
		editingRow = null;
	}

	$effect(() => {
		if (form?.success && form?.type === 'select') {
			queryResult = {
				columns: form.columns,
				rows: form.result
			};
		}
	});
</script>

<svelte:head>
	<title>Database Admin</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-gray-100">
	<!-- Header -->
	<header class="bg-gray-800 border-b border-gray-700 px-6 py-4">
		<div class="flex items-center justify-between">
			<h1 class="text-2xl font-bold text-white">Database Admin</h1>
			<a href="/" class="text-gray-400 hover:text-white transition">Back to App</a>
		</div>
	</header>

	<div class="flex">
		<!-- Sidebar - Tables List -->
		<aside class="w-64 bg-gray-800 min-h-[calc(100vh-73px)] border-r border-gray-700 p-4">
			<h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Tables</h2>
			<nav class="space-y-1">
				{#each data.tables as table}
					<a
						href="/admin?table={table.name}"
						class="flex items-center justify-between px-3 py-2 rounded-lg transition {data.selectedTable === table.name
							? 'bg-blue-600 text-white'
							: 'text-gray-300 hover:bg-gray-700'}"
					>
						<span class="font-medium">{table.name}</span>
						<span class="text-xs px-2 py-0.5 rounded-full {data.selectedTable === table.name ? 'bg-blue-500' : 'bg-gray-600'}">
							{table.rowCount}
						</span>
					</a>
				{/each}
			</nav>
		</aside>

		<!-- Main Content -->
		<main class="flex-1 p-6">
			{#if data.error}
				<div class="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
					{data.error}
				</div>
			{/if}

			<!-- Chat Stats Section -->
			{#if data.chatStats}
				<section class="bg-gray-800 rounded-lg p-4 mb-6">
					<h2 class="text-lg font-semibold mb-4">Chat Stats</h2>
					
					<!-- Stats Cards -->
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
						<div class="bg-gray-700 rounded-lg p-4">
							<div class="text-3xl font-bold text-blue-400">{data.chatStats.contactCount}</div>
							<div class="text-gray-400 text-sm">Contacte</div>
						</div>
						<div class="bg-gray-700 rounded-lg p-4">
							<div class="text-3xl font-bold text-green-400">{data.chatStats.messageCount}</div>
							<div class="text-gray-400 text-sm">Mesaje totale</div>
						</div>
						<div class="bg-gray-700 rounded-lg p-4">
							<div class="text-3xl font-bold text-purple-400">{data.tables.length}</div>
							<div class="text-gray-400 text-sm">Tabele în DB</div>
						</div>
					</div>

					<!-- Recent Messages -->
					{#if data.chatStats.recentMessages && data.chatStats.recentMessages.length > 0}
						<h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Mesaje recente</h3>
						<div class="space-y-2">
							{#each data.chatStats.recentMessages as msg}
								<div class="flex items-center gap-3 bg-gray-700/50 rounded-lg p-3">
									<div class="w-8 h-8 rounded-full bg-gradient-to-br {msg.sent ? 'from-blue-400 to-blue-600' : 'from-gray-500 to-gray-700'} flex items-center justify-center text-white text-xs font-bold">
										{msg.sent ? 'Tu' : msg.contact_name?.charAt(0) || '?'}
									</div>
									<div class="flex-1 min-w-0">
										<div class="flex items-center gap-2">
											<span class="text-sm font-medium text-white">{msg.contact_name || 'Unknown'}</span>
											<span class="text-xs text-gray-500">{msg.sent ? '(trimis)' : '(primit)'}</span>
										</div>
										<p class="text-gray-400 text-sm truncate">{msg.content}</p>
									</div>
									<div class="text-xs text-gray-500">
										#{msg.id}
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-gray-500 text-sm">Niciun mesaj în baza de date</p>
					{/if}
				</section>
			{/if}

			<!-- SQL Query Section -->
			<section class="bg-gray-800 rounded-lg p-4 mb-6">
				<h2 class="text-lg font-semibold mb-3">SQL Query</h2>
				<form method="POST" action="?/query" use:enhance>
					<textarea
						name="sql"
						bind:value={sqlQuery}
						placeholder="SELECT * FROM users LIMIT 10;"
						class="w-full h-24 bg-gray-900 border border-gray-600 rounded-lg p-3 font-mono text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
					></textarea>
					<div class="flex items-center gap-4 mt-3">
						<button
							type="submit"
							class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
						>
							Execute
						</button>
						{#if form && !form.success}
							<span class="text-red-400 text-sm">{form.error}</span>
						{/if}
						{#if form?.success && form?.type === 'execute'}
							<span class="text-green-400 text-sm">
								Success! {form.result.changes} row(s) affected
							</span>
						{/if}
					</div>
				</form>

				<!-- Query Results -->
				{#if queryResult && queryResult.rows.length > 0}
					<div class="mt-4 overflow-x-auto">
						<table class="w-full text-sm">
							<thead>
								<tr class="border-b border-gray-600">
									{#each queryResult.columns as col}
										<th class="text-left px-3 py-2 font-semibold text-gray-300">{col}</th>
									{/each}
								</tr>
							</thead>
							<tbody>
								{#each queryResult.rows as row}
									<tr class="border-b border-gray-700 hover:bg-gray-700/50">
										{#each queryResult.columns as col}
											<td class="px-3 py-2 font-mono text-xs">
												{String((row as Record<string, unknown>)[col] ?? 'NULL')}
											</td>
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</section>

			<!-- Table Data Section -->
			{#if data.selectedTable && data.tableData}
				<section class="bg-gray-800 rounded-lg p-4">
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-lg font-semibold">
							{data.selectedTable}
							<span class="text-gray-400 font-normal text-sm ml-2">
								({data.tableData.rows.length} rows shown)
							</span>
						</h2>
						<button
							onclick={openInsertModal}
							class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
						>
							+ Add Row
						</button>
					</div>

					<!-- Schema Info -->
					<div class="mb-4 flex flex-wrap gap-2">
						{#each data.tables.find((t) => t.name === data.selectedTable)?.columns ?? [] as col}
							<span class="px-2 py-1 bg-gray-700 rounded text-xs">
								<span class="text-gray-300">{col.name}</span>
								<span class="text-gray-500 ml-1">{col.type}</span>
							</span>
						{/each}
					</div>

					<!-- Data Table -->
					<div class="overflow-x-auto">
						<table class="w-full text-sm">
							<thead>
								<tr class="border-b border-gray-600">
									{#each data.tableData.columns as col}
										<th class="text-left px-3 py-2 font-semibold text-gray-300">{col}</th>
									{/each}
									<th class="text-right px-3 py-2 font-semibold text-gray-300">Actions</th>
								</tr>
							</thead>
							<tbody>
								{#each data.tableData.rows as row}
									<tr class="border-b border-gray-700 hover:bg-gray-700/50">
										{#each data.tableData.columns as col}
											<td class="px-3 py-2 font-mono text-xs max-w-xs truncate">
												{String(row[col] ?? 'NULL')}
											</td>
										{/each}
										<td class="px-3 py-2 text-right">
											<button
												onclick={() => openEditModal(row)}
												class="px-2 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded mr-1 transition"
											>
												Edit
											</button>
											<form method="POST" action="?/delete" class="inline" use:enhance={() => {
												return async ({ update }) => {
													await update();
													invalidateAll();
												};
											}}>
												<input type="hidden" name="table" value={data.selectedTable} />
												<input type="hidden" name="id" value={String(row[getIdColumn(data.selectedTable!)])} />
												<input type="hidden" name="idColumn" value={getIdColumn(data.selectedTable!)} />
												<button
													type="submit"
													onclick={(e) => {
														if (!confirm('Delete this row?')) e.preventDefault();
													}}
													class="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition"
												>
													Delete
												</button>
											</form>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</section>
			{:else if !data.selectedTable}
				<div class="bg-gray-800 rounded-lg p-8 text-center">
					<p class="text-gray-400">Select a table from the sidebar to view and manage data</p>
				</div>
			{/if}
		</main>
	</div>
</div>

<!-- Insert Modal -->
{#if showInsertModal && data.selectedTable}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
			<h3 class="text-lg font-semibold mb-4">Add Row to {data.selectedTable}</h3>
			<form method="POST" action="?/insert" use:enhance={() => {
				return async ({ update }) => {
					await update();
					closeModals();
					invalidateAll();
				};
			}}>
				<input type="hidden" name="table" value={data.selectedTable} />
				<input type="hidden" name="data" value={JSON.stringify(
					Object.fromEntries(
						Object.entries(insertData).filter(([_, v]) => v !== '')
					)
				)} />
				
				{#each Object.entries(insertData) as [key, _]}
					<div class="mb-3">
						<label class="block text-sm text-gray-400 mb-1">{key}</label>
						<input
							type="text"
							bind:value={insertData[key]}
							class="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none"
							placeholder="Leave empty for default/NULL"
						/>
					</div>
				{/each}
				
				<div class="flex justify-end gap-2 mt-4">
					<button
						type="button"
						onclick={closeModals}
						class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm transition"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm transition"
					>
						Insert
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Edit Modal -->
{#if editingRow && data.selectedTable}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
			<h3 class="text-lg font-semibold mb-4">Edit Row in {data.selectedTable}</h3>
			<form method="POST" action="?/update" use:enhance={() => {
				return async ({ update }) => {
					await update();
					closeModals();
					invalidateAll();
				};
			}}>
				<input type="hidden" name="table" value={data.selectedTable} />
				<input type="hidden" name="id" value={String(editingRow[getIdColumn(data.selectedTable)])} />
				<input type="hidden" name="idColumn" value={getIdColumn(data.selectedTable)} />
				<input type="hidden" name="data" value={JSON.stringify(editData)} />
				
				{#each Object.entries(editData) as [key, _]}
					<div class="mb-3">
						<label class="block text-sm text-gray-400 mb-1">{key}</label>
						<input
							type="text"
							bind:value={editData[key]}
							class="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none"
						/>
					</div>
				{/each}
				
				<div class="flex justify-end gap-2 mt-4">
					<button
						type="button"
						onclick={closeModals}
						class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm transition"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm transition"
					>
						Update
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
