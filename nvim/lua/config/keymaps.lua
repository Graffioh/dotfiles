-- General keymaps. Plugin-specific maps live in their own plugin files
-- (telescope, oil, lazygit, and LSP via LspAttach).
local map = vim.keymap.set

-- Clear search highlight with <Esc>
map("n", "<Esc>", "<cmd>nohlsearch<cr>", { desc = "Clear search highlight" })

-- Move between windows with <Ctrl-h/j/k/l>
map("n", "<C-h>", "<C-w>h", { desc = "Go to left window" })
map("n", "<C-j>", "<C-w>j", { desc = "Go to lower window" })
map("n", "<C-k>", "<C-w>k", { desc = "Go to upper window" })
map("n", "<C-l>", "<C-w>l", { desc = "Go to right window" })

-- Copy relative file path to system clipboard (kept from your old config)
map("n", "<leader>cp", function()
  local path = vim.fn.expand("%")
  vim.fn.setreg("+", path)
  print(path)
end, { desc = "Copy relative file path" })
