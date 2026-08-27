export const STANDALONE_HTML_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Family HQ | Task Manager (Bento Grid)</title>
  
  <!-- Tailwind CSS via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Lucide Icons via CDN -->
  <script src="https://unpkg.com/lucide@latest"></script>

  <!-- Canvas Confetti for Task Completion Celebration -->
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>

  <!-- Supabase JS Client v2 via CDN -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

  <style>
    @keyframes pulse-ring {
      0% { transform: scale(0.95); opacity: 0.8; }
      50% { transform: scale(1.15); opacity: 0.4; }
      100% { transform: scale(0.95); opacity: 0.8; }
    }
    .mic-pulsing {
      animation: pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans antialiased">

  <!-- ========================================== -->
  <!-- 1. TOP NAVIGATION & PROFILE BAR -->
  <!-- ========================================== -->
  <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      
      <!-- Brand Logo -->
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-tight">
              Family HQ <span class="text-slate-400 font-normal">| Task Manager</span>
            </h1>
            <span class="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              Bento Grid
            </span>
          </div>
          <p class="text-xs text-slate-500 font-medium hidden sm:block">Supabase Database & Voice AI Powered</p>
        </div>
      </div>

      <!-- Quick Role / Auth Controls -->
      <div class="flex items-center space-x-3" id="headerControls">
        
        <!-- Supabase Connection Indicator -->
        <button id="btnSupabaseSettings" onclick="openSupabaseModal()" class="hidden md:flex items-center space-x-2 text-xs px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
          <span class="w-2 h-2 rounded-full bg-emerald-500" id="dbStatusDot"></span>
          <span id="dbStatusText" class="font-bold text-slate-700">Supabase Connected</span>
        </button>

        <!-- Current User Profile Chip -->
        <div id="currentUserBadge" class="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div class="text-right">
            <p class="font-bold text-slate-900 text-xs" id="userName">Parent (Admin)</p>
            <span class="text-[10px] text-indigo-600 font-bold uppercase" id="userRoleBadge">Parent</span>
          </div>
          <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200" id="userAvatar">
            P
          </div>
        </div>

        <!-- Role Switcher -->
        <div class="relative inline-block text-left">
          <select id="quickMemberSelect" onchange="switchCurrentUser(this.value)" class="text-xs bg-slate-100 border border-slate-300 text-slate-800 font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
            <option value="parent-1">👨 Dad (Parent)</option>
            <option value="parent-2">👩 Mom (Parent)</option>
            <option value="child-1">👦 Ali (Child)</option>
            <option value="child-2">👧 Sara (Child)</option>
            <option value="child-3">👶 Hamza (Child)</option>
          </select>
        </div>

        <!-- Voice Quick Action Button -->
        <button onclick="startVoiceAction()" id="btnGlobalVoice" class="flex items-center space-x-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl text-xs font-bold transition">
          <i data-lucide="mic" class="w-4 h-4 text-indigo-600"></i>
          <span class="hidden sm:inline">Voice Task</span>
        </button>
      </div>
    </div>
  </header>

  <!-- ========================================== -->
  <!-- 2. MAIN BENTO GRID CONTAINER -->
  <!-- ========================================== -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">

    <!-- Bento Quick Task Bar -->
    <section class="bg-white rounded-2xl shadow-xs border border-slate-200 p-4">
      <form onsubmit="handleQuickAddTask(event)" class="flex flex-col sm:flex-row items-center gap-3">
        <div class="flex-1 w-full relative">
          <input
            type="text"
            id="quickInputTitle"
            placeholder="Naya task likhen... (e.g. Complete Biology Notes, Sabzi lani hai, Recite Quran)"
            class="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 font-medium text-xs sm:text-sm focus:outline-none"
          />
          <button
            type="button"
            onclick="startVoiceAction()"
            title="Voice Dictation (Microphone)"
            class="absolute right-2 top-2 p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
          >
            <i data-lucide="mic" class="w-5 h-5"></i>
          </button>
        </div>
        
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="submit"
            class="flex-1 sm:flex-none bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm hover:bg-indigo-700 transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <i data-lucide="plus-circle" class="w-4 h-4"></i>
            <span>Add Task</span>
          </button>
        </div>
      </form>
    </section>

    <!-- Bento Grid Layout: Main Area (8 cols) + Side Telemetry & Instructions (4 cols) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

      <!-- Left Column: Tasks and Dashboards -->
      <div class="lg:col-span-8 space-y-6">

        <!-- Navigation Tabs Bar -->
        <div class="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
            <button
              id="tabMyTasks"
              onclick="switchTab('today')"
              class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition bg-indigo-600 text-white shadow-xs"
            >
              <i data-lucide="calendar-check" class="w-4 h-4"></i>
              <span>Aaj ke Tasks (My Tasks)</span>
              <span id="badgeMyTasksCount" class="px-2 py-0.5 text-[10px] rounded-full font-bold bg-white/20 text-white">0</span>
            </button>

            <button
              id="tabParentAdmin"
              onclick="switchTab('parent')"
              class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition text-slate-600 hover:bg-slate-100"
            >
              <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
              <span>Parent Admin</span>
              <span class="px-2 py-0.5 text-[10px] rounded-full font-bold bg-slate-100 text-slate-700">All</span>
            </button>

            <button
              id="tabAuditLogs"
              onclick="switchTab('logs')"
              class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition text-slate-600 hover:bg-slate-100"
            >
              <i data-lucide="history" class="w-4 h-4"></i>
              <span>Audit Logs</span>
              <span id="badgeLogsCount" class="px-2 py-0.5 text-[10px] rounded-full font-bold bg-slate-100 text-slate-700">0</span>
            </button>
          </div>

          <div class="hidden sm:flex items-center space-x-1.5 text-xs text-slate-500 font-semibold px-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Sync</span>
          </div>
        </div>

        <!-- 2.1 My Tasks Section -->
        <section id="sectionMyTasks" class="space-y-6">
          
          <!-- Metric Stat Bento Grid Row -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Progress</p>
                <div class="flex items-baseline space-x-2 mt-1">
                  <h3 class="text-3xl font-extrabold text-slate-900" id="statMyProgressPct">0%</h3>
                  <span class="text-xs text-slate-500 font-semibold" id="statMyProgressFraction">(0/0)</span>
                </div>
                <p class="text-xs text-slate-500 mt-0.5" id="statMyProgressStatus">0 tasks remaining</p>
              </div>
              <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <i data-lucide="trophy" class="w-6 h-6"></i>
              </div>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Daily Streak</p>
                <h3 class="text-3xl font-extrabold text-rose-600 mt-1" id="statMyStreak">🔥 0 Days</h3>
                <p class="text-xs text-slate-500 mt-0.5">Consistency streak</p>
              </div>
              <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <i data-lucide="flame" class="w-6 h-6"></i>
              </div>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Reward Stars</p>
                <h3 class="text-3xl font-extrabold text-amber-600 mt-1" id="statMyPoints">⭐ 0 pts</h3>
                <p class="text-xs text-slate-500 mt-0.5">Family leaderboard</p>
              </div>
              <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <i data-lucide="star" class="w-6 h-6"></i>
              </div>
            </div>
          </div>

          <!-- Filter & Category Bar -->
          <div class="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div class="flex items-center space-x-2">
              <button onclick="filterMyTasks('all')" id="btnFilterAll" class="text-xs px-3 py-1.5 rounded-xl font-bold bg-slate-900 text-white shadow-xs">All</button>
              <button onclick="filterMyTasks('pending')" id="btnFilterPending" class="text-xs px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200">Pending</button>
              <button onclick="filterMyTasks('completed')" id="btnFilterCompleted" class="text-xs px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200">Completed</button>
            </div>

            <div class="flex items-center space-x-2 text-xs">
              <span class="text-slate-400 font-bold uppercase">Category:</span>
              <select id="selectCategoryFilter" onchange="filterByCategory(this.value)" class="text-xs bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                <option value="all">All Categories</option>
                <option value="chores">🧹 Chores</option>
                <option value="homework">📚 Homework</option>
                <option value="deen">🕌 Prayer / Deen</option>
                <option value="health">🥗 Health</option>
                <option value="reading">📖 Reading</option>
                <option value="general">✨ General</option>
              </select>
            </div>
          </div>

          <!-- Task Cards Grid -->
          <div id="myTasksGrid" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Dynamic task cards will be rendered here via JS -->
          </div>
        </section>

        <!-- 2.2 Parent Admin Section -->
        <section id="sectionParentAdmin" class="space-y-6 hidden">
          
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Completion Rate</span>
              <div class="mt-3">
                <h3 class="text-3xl font-extrabold text-slate-900" id="parentStatCompletion">0%</h3>
                <div class="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                  <div id="parentStatBar" class="bg-indigo-600 h-full rounded-full transition-all" style="width: 0%"></div>
                </div>
              </div>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Family Members</span>
              <div class="mt-3">
                <h3 class="text-3xl font-extrabold text-slate-900" id="parentStatMembers">5</h3>
                <p class="text-xs text-slate-500 mt-1">Active Profiles</p>
              </div>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Star Bank</span>
              <div class="mt-3">
                <h3 class="text-3xl font-extrabold text-amber-600" id="parentStatStars">0 ⭐</h3>
                <p class="text-xs text-slate-500 mt-1">Total points earned</p>
              </div>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Top Streak</span>
              <div class="mt-3">
                <h3 class="text-3xl font-extrabold text-rose-600" id="parentStatStreak">🔥 0d</h3>
                <p class="text-xs text-slate-500 mt-1">Daily consistency</p>
              </div>
            </div>
          </div>

          <div id="parentMembersGrid" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Rendered by JS -->
          </div>
        </section>

        <!-- 2.3 Activity Logs Section -->
        <section id="sectionAuditLogs" class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden hidden">
          <div class="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-900">Task Activity & Reward Logs</h3>
            <span class="text-xs text-slate-500">Real-time timestamped audit</span>
          </div>
          <div id="auditLogsContainer" class="divide-y divide-slate-100">
            <!-- Rendered by JS -->
          </div>
        </section>

      </div>

      <!-- Right Column: Bento Panels (Family Tracking & Setup Guide) -->
      <div class="lg:col-span-4 space-y-6">

        <!-- Dark Bento Card: Family Tracking -->
        <section class="bg-indigo-950 rounded-2xl shadow-md border border-indigo-900 p-5 text-white">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-bold flex items-center gap-2">
              <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Family Tracking</span>
            </h2>
            <span class="text-[11px] font-bold bg-indigo-900 text-indigo-200 px-2 py-0.5 rounded-full">
              Today's Pulse
            </span>
          </div>

          <div id="sideFamilyTrackingList" class="space-y-4">
            <!-- Rendered by JS -->
          </div>

          <div class="mt-5 pt-4 border-t border-indigo-900/60 flex items-center justify-between text-xs">
            <span class="text-indigo-300">Total Stars Earned:</span>
            <span id="sideTotalStars" class="font-extrabold text-amber-300 text-sm">0 ⭐</span>
          </div>
        </section>

        <!-- Bento Card: Setup Instructions (Urdu) -->
        <section class="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 flex flex-col space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 class="text-xs font-black text-slate-800 uppercase tracking-widest">
              Setup Instructions (Urdu)
            </h2>
            <span class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Supabase & Voice
            </span>
          </div>

          <div class="text-xs space-y-4 leading-relaxed text-slate-600">
            <div>
              <p class="font-bold text-indigo-700 mb-1">1. Supabase Setup (Urdu)</p>
              <p class="text-[11px]">
                Supabase dashboard par naya project banayein aur SQL editor mein niche wala code paste karein table banane ke liye.
              </p>
            </div>

            <div class="bg-slate-900 text-indigo-200 p-3 rounded-xl font-mono text-[10px] select-all leading-relaxed overflow-x-auto">
              <code>
                CREATE TABLE tasks (&#10;
                &nbsp;&nbsp;id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,&#10;
                &nbsp;&nbsp;user_id uuid REFERENCES auth.users,&#10;
                &nbsp;&nbsp;title TEXT NOT NULL,&#10;
                &nbsp;&nbsp;category TEXT DEFAULT 'general',&#10;
                &nbsp;&nbsp;completed BOOLEAN DEFAULT false&#10;
                );
              </code>
            </div>

            <div>
              <p class="font-bold text-indigo-700 mb-1">2. Voice-to-Text Setup</p>
              <p class="text-[11px]">
                Browser ke native <strong class="text-slate-800">SpeechRecognition</strong> API ko use karein. Microphone button par click karein aur seedha bolen.
              </p>
            </div>

            <div>
              <p class="font-bold text-indigo-700 mb-1">3. Admin & Role Control</p>
              <p class="text-[11px]">
                Admin dashboard view sirf 'Parent' role wale users ke liye hai. Row Level Security (RLS) policies lazmi active karein.
              </p>
            </div>

            <div class="pt-2">
              <button
                onclick="openTaskModal()"
                class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i>
                <span>Open Task Creator</span>
              </button>
            </div>
          </div>
        </section>

      </div>

    </div>

  </main>

  <!-- ========================================== -->
  <!-- 3. MODALS (Task, Voice, Supabase) -->
  <!-- ========================================== -->

  <!-- Task Modal -->
  <div id="modalTask" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative my-8">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 class="text-base font-bold text-slate-900" id="taskModalTitle">Create New Family Task</h3>
        <button onclick="closeTaskModal()" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <form onsubmit="handleSaveTaskForm(event)" class="space-y-4 mt-5">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Task Title *</label>
          <input type="text" id="inputTaskTitle" required placeholder="e.g. Complete Algebra Exercises" class="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Description (Optional)</label>
          <textarea id="inputTaskDesc" rows="2" placeholder="e.g. Double check formulas in chapter 4" class="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Assign To</label>
            <select id="inputTaskAssignee" class="w-full text-sm rounded-xl border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"></select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Category</label>
            <select id="inputTaskCategory" class="w-full text-sm rounded-xl border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none">
              <option value="chores">🧹 Chores</option>
              <option value="homework">📚 Homework</option>
              <option value="deen">🕌 Prayer / Deen</option>
              <option value="health">🥗 Health</option>
              <option value="reading">📖 Reading</option>
              <option value="general">✨ General</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Recurrence</label>
            <select id="inputTaskRecurrence" class="w-full text-sm rounded-xl border border-slate-300 px-3 py-2 bg-white">
              <option value="daily">🔄 Daily</option>
              <option value="weekly">📅 Weekly</option>
              <option value="none">🎯 One-Time</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Reward Stars</label>
            <input type="number" id="inputTaskPoints" min="5" max="100" step="5" value="15" class="w-full text-sm rounded-xl border border-slate-300 px-3 py-2 font-bold text-indigo-700" />
          </div>
        </div>

        <div class="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
          <button type="button" onclick="closeTaskModal()" class="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
          <button type="submit" class="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs">Save Task</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Voice Modal -->
  <div id="modalVoice" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 class="text-base font-bold text-slate-900">Voice-to-Text Task Assistant</h3>
        <button onclick="closeVoiceModal()" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="py-8 flex flex-col items-center justify-center text-center space-y-4">
        <button id="btnVoicePulse" onclick="toggleVoiceRecording()" class="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg transition transform active:scale-95">
          <i data-lucide="mic" class="w-8 h-8"></i>
        </button>
        <div>
          <p id="voiceStatusText" class="text-sm font-bold text-slate-900">Listening to your voice...</p>
          <p class="text-xs text-slate-500 mt-1">Say: "Add task complete chemistry homework for Ali daily"</p>
        </div>
      </div>

      <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
        <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Live Transcript:</span>
        <p id="voiceTranscriptText" class="text-slate-800 font-medium italic min-h-[36px]">Speak into microphone...</p>
      </div>

      <div id="voiceParsedContainer" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl hidden space-y-2">
        <h4 id="voiceParsedTitle" class="text-sm font-bold text-slate-900"></h4>
        <button onclick="confirmVoiceTask()" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs">Add Task to Dashboard</button>
      </div>
    </div>
  </div>

  <!-- Supabase Settings Modal -->
  <div id="modalSupabase" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 class="text-base font-bold text-slate-900">Supabase Connection Settings</h3>
        <button onclick="closeSupabaseModal()" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <form onsubmit="handleSaveSupabase(event)" class="space-y-4 mt-5">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Supabase Project URL</label>
          <input type="url" id="inputSupaUrl" placeholder="https://xyz.supabase.co" class="w-full text-xs font-mono rounded-xl border border-slate-300 px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Supabase Anon Key</label>
          <input type="password" id="inputSupaKey" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..." class="w-full text-xs font-mono rounded-xl border border-slate-300 px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
        </div>
        <div class="flex items-center justify-between pt-4 border-t border-slate-100">
          <button type="button" onclick="resetToDemo()" class="text-xs font-bold text-slate-500 hover:underline">Reset to Demo Mode</button>
          <button type="submit" class="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">Save Credentials</button>
        </div>
      </form>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- 4. JAVASCRIPT APPLICATION CORE -->
  <!-- ========================================== -->
  <script>
    // Initial State
    const DEFAULT_MEMBERS = [
      { id: 'parent-1', full_name: 'Dad', role: 'parent', points: 280, streak: 12, color: 'bg-blue-600' },
      { id: 'parent-2', full_name: 'Mom', role: 'parent', points: 310, streak: 15, color: 'bg-purple-600' },
      { id: 'child-1', full_name: 'Ali', role: 'child', points: 140, streak: 5, color: 'bg-emerald-600' },
      { id: 'child-2', full_name: 'Sara', role: 'child', points: 195, streak: 8, color: 'bg-amber-600' },
      { id: 'child-3', full_name: 'Hamza', role: 'child', points: 80, streak: 3, color: 'bg-rose-600' }
    ];

    const DEFAULT_TASKS = [
      { id: 'task-1', title: 'Morning Fajr Prayer & Quran Recitation', description: 'Read 2 pages of Surah Yaseen after Fajr.', category: 'deen', priority: 'high', recurrence_type: 'daily', assigned_to: 'child-1', points_reward: 15 },
      { id: 'task-2', title: 'Complete Mathematics Homework (Algebra Ch 4)', description: 'Solve exercises 4.1 to 4.3.', category: 'homework', priority: 'high', recurrence_type: 'none', assigned_to: 'child-1', points_reward: 20 },
      { id: 'task-3', title: 'Clean Room & Organize Bookshelf', description: 'Tidy up desk and put clean clothes in closet.', category: 'chores', priority: 'medium', recurrence_type: 'daily', assigned_to: 'child-1', points_reward: 10 },
      { id: 'task-4', title: 'Science Solar System Model Chart', description: 'Paint planets chart.', category: 'homework', priority: 'high', recurrence_type: 'weekly', assigned_to: 'child-2', points_reward: 25 },
      { id: 'task-5', title: 'Drink 6 Glasses of Water & Jog', description: 'Stay hydrated through the day.', category: 'health', priority: 'medium', recurrence_type: 'daily', assigned_to: 'child-2', points_reward: 15 },
      { id: 'task-6', title: 'Read 20 min Storybook', description: 'Read Treasure Island chapter 3.', category: 'reading', priority: 'low', recurrence_type: 'daily', assigned_to: 'child-3', points_reward: 10 }
    ];

    let members = JSON.parse(localStorage.getItem('family_members_data')) || DEFAULT_MEMBERS;
    let tasks = JSON.parse(localStorage.getItem('family_tasks_data')) || DEFAULT_TASKS;
    let taskLogs = JSON.parse(localStorage.getItem('family_task_logs')) || [
      { id: 'log-1', task_id: 'task-3', task_title: 'Clean Room & Organize Bookshelf', user_id: 'child-1', user_name: 'Ali', completed_at: new Date().toISOString(), status: 'completed', points_awarded: 10 }
    ];
    let currentMemberId = localStorage.getItem('family_active_member') || 'parent-1';
    let activeTab = 'today';
    let myTasksFilter = 'all';
    let myCategoryFilter = 'all';
    let parsedVoiceTask = null;
    let speechRecognition = null;
    let isRecordingVoice = false;

    // Save State
    function persistData() {
      localStorage.setItem('family_members_data', JSON.stringify(members));
      localStorage.setItem('family_tasks_data', JSON.stringify(tasks));
      localStorage.setItem('family_task_logs', JSON.stringify(taskLogs));
      localStorage.setItem('family_active_member', currentMemberId);
    }

    function getCurrentMember() {
      return members.find(m => m.id === currentMemberId) || members[0];
    }

    function isTaskCompletedToday(taskId) {
      const todayStr = new Date().toISOString().split('T')[0];
      return taskLogs.some(l => l.task_id === taskId && l.completed_at.startsWith(todayStr));
    }

    // Tab Switching
    function switchTab(tab) {
      activeTab = tab;
      document.getElementById('sectionMyTasks').classList.toggle('hidden', tab !== 'today');
      document.getElementById('sectionParentAdmin').classList.toggle('hidden', tab !== 'parent');
      document.getElementById('sectionAuditLogs').classList.toggle('hidden', tab !== 'logs');

      document.getElementById('tabMyTasks').className = tab === 'today' ? 'px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition bg-indigo-600 text-white shadow-xs' : 'px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition text-slate-600 hover:bg-slate-100';
      document.getElementById('tabParentAdmin').className = tab === 'parent' ? 'px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition bg-indigo-600 text-white shadow-xs' : 'px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition text-slate-600 hover:bg-slate-100';
      document.getElementById('tabAuditLogs').className = tab === 'logs' ? 'px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition bg-indigo-600 text-white shadow-xs' : 'px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition text-slate-600 hover:bg-slate-100';

      renderAll();
    }

    function switchCurrentUser(memberId) {
      currentMemberId = memberId;
      persistData();
      renderAll();
    }

    function toggleTask(taskId) {
      const target = tasks.find(t => t.id === taskId);
      if (!target) return;

      const todayStr = new Date().toISOString().split('T')[0];
      const logIndex = taskLogs.findIndex(l => l.task_id === taskId && l.completed_at.startsWith(todayStr));

      if (logIndex >= 0) {
        // Unmark
        const removed = taskLogs[logIndex];
        taskLogs.splice(logIndex, 1);
        const m = members.find(mem => mem.id === target.assigned_to);
        if (m) m.points = Math.max(0, m.points - removed.points_awarded);
      } else {
        // Mark complete
        const m = members.find(mem => mem.id === target.assigned_to);
        const newLog = {
          id: 'log-' + Date.now(),
          task_id: target.id,
          task_title: target.title,
          user_id: target.assigned_to,
          user_name: m ? m.full_name : 'Member',
          completed_at: new Date().toISOString(),
          status: 'completed',
          points_awarded: target.points_reward
        };
        taskLogs.unshift(newLog);
        if (m) {
          m.points += target.points_reward;
          m.streak += 1;
        }

        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }

      persistData();
      renderAll();
    }

    function handleQuickAddTask(e) {
      if (e) e.preventDefault();
      const input = document.getElementById('quickInputTitle');
      const val = input.value.trim();
      if (!val) {
        openTaskModal();
        return;
      }

      const newTask = {
        id: 'task-' + Date.now(),
        title: val,
        category: 'general',
        priority: 'medium',
        recurrence_type: 'daily',
        assigned_to: currentMemberId,
        points_reward: 15
      };

      tasks.unshift(newTask);
      input.value = '';
      persistData();
      renderAll();

      confetti({ particleCount: 35, spread: 50 });
    }

    function filterMyTasks(filter) {
      myTasksFilter = filter;
      document.getElementById('btnFilterAll').className = filter === 'all' ? 'text-xs px-3 py-1.5 rounded-xl font-bold bg-slate-900 text-white shadow-xs' : 'text-xs px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200';
      document.getElementById('btnFilterPending').className = filter === 'pending' ? 'text-xs px-3 py-1.5 rounded-xl font-bold bg-amber-600 text-white shadow-xs' : 'text-xs px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200';
      document.getElementById('btnFilterCompleted').className = filter === 'completed' ? 'text-xs px-3 py-1.5 rounded-xl font-bold bg-emerald-600 text-white shadow-xs' : 'text-xs px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200';
      renderMyTasks();
    }

    function filterByCategory(cat) {
      myCategoryFilter = cat;
      renderMyTasks();
    }

    // Rendering functions
    function renderAll() {
      const cur = getCurrentMember();
      document.getElementById('userName').textContent = cur.full_name;
      document.getElementById('userRoleBadge').textContent = cur.role;
      document.getElementById('userAvatar').textContent = cur.full_name[0];
      document.getElementById('quickMemberSelect').value = cur.id;

      renderMyTasks();
      renderParentAdmin();
      renderAuditLogs();
      renderSideTracking();

      if (window.lucide) lucide.createIcons();
    }

    function renderMyTasks() {
      const cur = getCurrentMember();
      const myTasks = tasks.filter(t => t.assigned_to === cur.id);
      const completed = myTasks.filter(t => isTaskCompletedToday(t.id)).length;
      const pending = myTasks.length - completed;
      const pct = myTasks.length > 0 ? Math.round((completed / myTasks.length) * 100) : 0;

      document.getElementById('badgeMyTasksCount').textContent = myTasks.length;
      document.getElementById('statMyProgressPct').textContent = pct + '%';
      document.getElementById('statMyProgressFraction').textContent = \`(\${completed}/\${myTasks.length})\`;
      document.getElementById('statMyProgressStatus').textContent = \`\${pending} tasks remaining\`;
      document.getElementById('statMyStreak').textContent = \`🔥 \${cur.streak} Days\`;
      document.getElementById('statMyPoints').textContent = \`⭐ \${cur.points} pts\`;

      let filtered = myTasks;
      if (myTasksFilter === 'pending') filtered = filtered.filter(t => !isTaskCompletedToday(t.id));
      if (myTasksFilter === 'completed') filtered = filtered.filter(t => isTaskCompletedToday(t.id));
      if (myCategoryFilter !== 'all') filtered = filtered.filter(t => t.category === myCategoryFilter);

      const grid = document.getElementById('myTasksGrid');
      if (filtered.length === 0) {
        grid.innerHTML = \`<div class="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 p-6 text-slate-400 text-xs">No tasks in this category.</div>\`;
        return;
      }

      grid.innerHTML = filtered.map(t => {
        const isDone = isTaskCompletedToday(t.id);
        return \`
          <div class="rounded-2xl border p-5 shadow-xs transition flex flex-col justify-between space-y-3 \${isDone ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-slate-200 hover:shadow-md'}">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">\${t.category}</span>
                <span class="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">+\${t.points_reward} ⭐</span>
              </div>
              <h4 class="text-base font-bold \${isDone ? 'line-through text-slate-400' : 'text-slate-900'}">\${t.title}</h4>
              \${t.description ? \`<p class="text-xs \${isDone ? 'line-through text-slate-400' : 'text-slate-500'}">\${t.description}</p>\` : ''}
            </div>
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span class="text-[11px] text-slate-400 font-medium">Due: Today</span>
              <button onclick="toggleTask('\${t.id}')" class="px-4 py-2 rounded-xl text-xs font-extrabold transition shadow-xs \${isDone ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-emerald-600 hover:text-white'}">
                \${isDone ? '✓ Completed!' : 'Mark Complete'}
              </button>
            </div>
          </div>
        \`;
      }).join('');
    }

    function renderParentAdmin() {
      const todayStr = new Date().toISOString().split('T')[0];
      const total = tasks.length;
      const completed = tasks.filter(t => isTaskCompletedToday(t.id)).length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      document.getElementById('parentStatCompletion').textContent = pct + '%';
      document.getElementById('parentStatBar').style.width = pct + '%';
      document.getElementById('parentStatStars').textContent = members.reduce((acc, m) => acc + m.points, 0) + ' ⭐';
      document.getElementById('parentStatStreak').textContent = '🔥 ' + Math.max(...members.map(m => m.streak)) + 'd';

      const grid = document.getElementById('parentMembersGrid');
      grid.innerHTML = members.map(m => {
        const memTasks = tasks.filter(t => t.assigned_to === m.id);
        const memCompleted = memTasks.filter(t => isTaskCompletedToday(t.id)).length;
        const memPct = memTasks.length > 0 ? Math.round((memCompleted / memTasks.length) * 100) : 0;

        return \`
          <div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center">\${m.full_name[0]}</div>
                <div>
                  <h4 class="text-sm font-bold text-slate-900">\${m.full_name}</h4>
                  <span class="text-[10px] uppercase font-bold text-slate-400">\${m.role}</span>
                </div>
              </div>
              <span class="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">⭐ \${m.points} pts</span>
            </div>
            <div class="space-y-1">
              <div class="flex justify-between text-xs font-semibold">
                <span class="text-slate-600">Progress</span>
                <span class="text-indigo-700 font-bold">\${memPct}% (\${memCompleted}/\${memTasks.length})</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div class="bg-indigo-600 h-full rounded-full" style="width: \${memPct}%"></div>
              </div>
            </div>
            <button onclick="switchCurrentUser('\${m.id}'); switchTab('today');" class="w-full text-center text-xs font-bold text-slate-600 hover:text-indigo-700 py-1.5 rounded-xl transition">
              Switch View as \${m.full_name} →
            </button>
          </div>
        \`;
      }).join('');
    }

    function renderAuditLogs() {
      document.getElementById('badgeLogsCount').textContent = taskLogs.length;
      const c = document.getElementById('auditLogsContainer');
      if (taskLogs.length === 0) {
        c.innerHTML = '<div class="p-8 text-center text-slate-400 text-xs italic">No activity logs recorded yet.</div>';
        return;
      }
      c.innerHTML = taskLogs.map(l => \`
        <div class="p-4 flex items-center justify-between hover:bg-slate-50">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">\${l.user_name ? l.user_name[0] : 'U'}</div>
            <div>
              <p class="text-xs font-bold text-slate-900">\${l.user_name} completed "<span class="text-indigo-700">\${l.task_title}</span>"</p>
              <span class="text-[10px] text-slate-400">\${new Date(l.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
          <span class="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">+\${l.points_awarded} ⭐</span>
        </div>
      \`).join('');
    }

    function renderSideTracking() {
      const list = document.getElementById('sideFamilyTrackingList');
      const colors = ['bg-emerald-400', 'bg-amber-400', 'bg-rose-400', 'bg-cyan-400', 'bg-indigo-400'];
      
      list.innerHTML = members.map((m, idx) => {
        const memTasks = tasks.filter(t => t.assigned_to === m.id);
        const memCompleted = memTasks.filter(t => isTaskCompletedToday(t.id)).length;
        const pct = memTasks.length > 0 ? Math.round((memCompleted / memTasks.length) * 100) : 0;
        const barColor = colors[idx % colors.length];

        return \`
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-indigo-800 flex items-center justify-center text-[10px] font-bold text-white">\${m.full_name[0]}</div>
                <span class="font-semibold text-slate-200">\${m.full_name}</span>
                <span class="text-[10px] text-indigo-300">(\${m.role})</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-[11px] text-amber-300 font-bold">⭐ \${m.points}</span>
                <span class="text-[10px] text-slate-400">\${pct}%</span>
              </div>
            </div>
            <div class="w-full h-2 bg-indigo-900/80 rounded-full overflow-hidden">
              <div class="\${barColor} h-full transition-all duration-500 rounded-full" style="width: \${pct}%"></div>
            </div>
          </div>
        \`;
      }).join('');

      document.getElementById('sideTotalStars').textContent = members.reduce((acc, m) => acc + m.points, 0) + ' ⭐';
    }

    // Modal helpers
    function openTaskModal() {
      const s = document.getElementById('inputTaskAssignee');
      s.innerHTML = members.map(m => \`<option value="\${m.id}">\${m.full_name} (\${m.role})</option>\`).join('');
      document.getElementById('modalTask').classList.remove('hidden');
      document.getElementById('modalTask').classList.add('flex');
    }
    function closeTaskModal() {
      document.getElementById('modalTask').classList.add('hidden');
      document.getElementById('modalTask').classList.remove('flex');
    }

    function handleSaveTaskForm(e) {
      e.preventDefault();
      const newTask = {
        id: 'task-' + Date.now(),
        title: document.getElementById('inputTaskTitle').value.trim(),
        description: document.getElementById('inputTaskDesc').value.trim(),
        assigned_to: document.getElementById('inputTaskAssignee').value,
        category: document.getElementById('inputTaskCategory').value,
        recurrence_type: document.getElementById('inputTaskRecurrence').value,
        points_reward: parseInt(document.getElementById('inputTaskPoints').value, 10) || 15
      };
      tasks.unshift(newTask);
      persistData();
      renderAll();
      closeTaskModal();
      confetti({ particleCount: 40, spread: 50 });
    }

    // Voice Modal
    function startVoiceAction() {
      document.getElementById('modalVoice').classList.remove('hidden');
      document.getElementById('modalVoice').classList.add('flex');
      startVoiceListening();
    }
    function closeVoiceModal() {
      stopVoiceListening();
      document.getElementById('modalVoice').classList.add('hidden');
      document.getElementById('modalVoice').classList.remove('flex');
    }

    function startVoiceListening() {
      const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Speech) {
        document.getElementById('voiceStatusText').textContent = 'Speech Recognition not supported in this browser.';
        return;
      }
      try {
        speechRecognition = new Speech();
        speechRecognition.continuous = true;
        speechRecognition.interimResults = true;
        speechRecognition.onresult = (e) => {
          let text = '';
          for (let i = 0; i < e.results.length; i++) {
            text += e.results[i][0].transcript;
          }
          document.getElementById('voiceTranscriptText').textContent = text;
          parseVoiceCommand(text);
        };
        speechRecognition.start();
        isRecordingVoice = true;
      } catch (err) {
        console.warn(err);
      }
    }

    function stopVoiceListening() {
      if (speechRecognition) {
        speechRecognition.stop();
        speechRecognition = null;
      }
      isRecordingVoice = false;
    }

    function toggleVoiceRecording() {
      if (isRecordingVoice) {
        stopVoiceListening();
        document.getElementById('voiceStatusText').textContent = 'Microphone Paused';
      } else {
        startVoiceListening();
        document.getElementById('voiceStatusText').textContent = 'Listening to your voice...';
      }
    }

    function parseVoiceCommand(text) {
      if (!text.trim()) return;
      const lower = text.toLowerCase();
      let target = members.find(m => lower.includes(m.full_name.toLowerCase())) || members[2];
      let cleaned = text.replace(/add task|create task|for ali|for sara|for hamza|daily|weekly/gi, '').trim();
      if (!cleaned) cleaned = text;

      parsedVoiceTask = {
        id: 'task-' + Date.now(),
        title: cleaned.charAt(0).toUpperCase() + cleaned.slice(1),
        assigned_to: target.id,
        category: lower.includes('homework') ? 'homework' : lower.includes('clean') ? 'chores' : 'general',
        recurrence_type: 'daily',
        points_reward: 15
      };

      document.getElementById('voiceParsedContainer').classList.remove('hidden');
      document.getElementById('voiceParsedTitle').textContent = \`Ready to add: "\${parsedVoiceTask.title}" for \${target.full_name}\`;
    }

    function confirmVoiceTask() {
      if (parsedVoiceTask) {
        tasks.unshift(parsedVoiceTask);
        persistData();
        renderAll();
        closeVoiceModal();
        confetti({ particleCount: 40, spread: 50 });
      }
    }

    // Supabase Modal
    function openSupabaseModal() {
      document.getElementById('inputSupaUrl').value = localStorage.getItem('family_supa_url') || '';
      document.getElementById('inputSupaKey').value = localStorage.getItem('family_supa_key') || '';
      document.getElementById('modalSupabase').classList.remove('hidden');
      document.getElementById('modalSupabase').classList.add('flex');
    }
    function closeSupabaseModal() {
      document.getElementById('modalSupabase').classList.add('hidden');
      document.getElementById('modalSupabase').classList.remove('flex');
    }
    function handleSaveSupabase(e) {
      e.preventDefault();
      localStorage.setItem('family_supa_url', document.getElementById('inputSupaUrl').value.trim());
      localStorage.setItem('family_supa_key', document.getElementById('inputSupaKey').value.trim());
      closeSupabaseModal();
      renderAll();
    }
    function resetToDemo() {
      localStorage.removeItem('family_supa_url');
      localStorage.removeItem('family_supa_key');
      closeSupabaseModal();
      renderAll();
    }

    // On Load
    window.addEventListener('DOMContentLoaded', () => {
      renderAll();
    });
  </script>
</body>
</html>
`;
