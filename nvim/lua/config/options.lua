-- Editor options. Sensible, minimal defaults (roughly what LazyVim gave you,
-- but explicit and yours to tweak).
local opt = vim.opt

-- UI
opt.number = true -- absolute line number on the cursor line
opt.relativenumber = true -- relative numbers elsewhere (fast j/k motions)
opt.cursorline = true -- highlight the current line
opt.signcolumn = "yes" -- always show the sign column (no text shift)
opt.termguicolors = true -- 24-bit color (required for eldritch)
opt.showmode = false -- mode is shown in lualine instead
opt.scrolloff = 8 -- keep this many lines above/below the cursor
opt.wrap = false -- no soft-wrap by default

-- Splits
opt.splitright = true -- vertical splits open to the right
opt.splitbelow = true -- horizontal splits open below

-- Indentation (2 spaces; clangd/.clang-format etc. still win per-project)
opt.expandtab = true -- tabs -> spaces
opt.shiftwidth = 2
opt.tabstop = 2
opt.smartindent = true
opt.breakindent = true -- wrapped lines keep indentation

-- Search
opt.ignorecase = true
opt.smartcase = true -- ...unless the query has uppercase
opt.inccommand = "split" -- live preview of :substitute

-- Files / undo
opt.undofile = true -- persistent undo across sessions
opt.swapfile = false
opt.confirm = true -- prompt instead of failing on unsaved changes

-- System clipboard (matches your previous LazyVim behavior)
opt.clipboard = "unnamedplus"

-- Responsiveness
opt.updatetime = 250 -- faster CursorHold / diagnostics
opt.timeoutlen = 400 -- mapped-sequence wait time
opt.mouse = "a"

-- Whitespace hints
opt.list = true
opt.listchars = { tab = "» ", trail = "·", nbsp = "␣" }
