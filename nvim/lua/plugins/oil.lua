-- oil.nvim: edit your filesystem like a normal buffer.
-- Press "-" to open the parent directory; edit/create/rename/delete by editing
-- lines, then :w to apply. `g.` toggles hidden files at runtime.
-- Loaded eagerly (lazy = false) so it can hijack netrw and handle `nvim <dir>`.
return {
  "stevearc/oil.nvim",
  lazy = false,
  dependencies = { "nvim-tree/nvim-web-devicons" },
  opts = {
    view_options = {
      show_hidden = true,
    },
  },
  keys = {
    { "-", "<cmd>Oil<cr>", desc = "Open parent directory (oil)" },
  },
}
