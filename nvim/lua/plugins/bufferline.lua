-- Bufferline: a tab-style strip across the top showing open buffers.
-- Navigate it with <Tab>/<S-Tab> (bnext/bprev) defined in config/keymaps.lua;
-- bufferline orders by buffer number by default, so those follow the strip.
return {
  "akinsho/bufferline.nvim",
  version = "*",
  dependencies = { "nvim-tree/nvim-web-devicons" },
  event = "VeryLazy",
  opts = {
    options = {
      mode = "buffers",
      diagnostics = "nvim_lsp", -- show LSP errors/warnings on each buffer
      show_buffer_close_icons = false,
      show_close_icon = false,
      separator_style = "thin",
    },
  },
  keys = {
    -- Jump straight to a buffer by its position on the strip.
    { "<leader>1", "<cmd>BufferLineGoToBuffer 1<cr>", desc = "Buffer 1" },
    { "<leader>2", "<cmd>BufferLineGoToBuffer 2<cr>", desc = "Buffer 2" },
    { "<leader>3", "<cmd>BufferLineGoToBuffer 3<cr>", desc = "Buffer 3" },
    { "<leader>4", "<cmd>BufferLineGoToBuffer 4<cr>", desc = "Buffer 4" },
    { "<leader>5", "<cmd>BufferLineGoToBuffer 5<cr>", desc = "Buffer 5" },
  },
}
