-- Neogit: a magit-style git UI that lives in a native nvim buffer (not a
-- terminal). In the status buffer, <enter> on a file opens it right here in
-- this neovim, and <tab> toggles its diff inline -- no remote/editor wiring
-- needed (the reason we moved off lazygit).
-- <leader>gg opens the status buffer.
return {
  "NeogitOrg/neogit",
  cmd = "Neogit",
  dependencies = {
    "nvim-lua/plenary.nvim",
    "sindrets/diffview.nvim", -- richer side-by-side diffs (press `d`)
    "nvim-telescope/telescope.nvim", -- pickers for branches/commits/etc.
  },
  keys = {
    { "<leader>gg", "<cmd>Neogit<cr>", desc = "Neogit" },
  },
  opts = {
    -- Syntax-highlight diff hunks in the status buffer via treesitter
    -- (off by default). Uses the parser for each file's filetype, so the
    -- ts/tsx/js/json/etc. parsers installed in treesitter.lua must be present.
    treesitter_diff_highlight = true,
    integrations = {
      telescope = true,
      diffview = true,
    },
  },
}
