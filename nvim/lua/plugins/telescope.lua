-- Telescope: fuzzy finder over files, grep, buffers, help.
-- live_grep needs ripgrep (rg); the optional fzf-native sorter needs make + cc.
return {
  "nvim-telescope/telescope.nvim",
  version = "*", -- track latest stable release
  cmd = "Telescope",
  dependencies = {
    "nvim-lua/plenary.nvim",
    "nvim-tree/nvim-web-devicons",
    {
      "nvim-telescope/telescope-fzf-native.nvim",
      build = "make",
      cond = function()
        return vim.fn.executable("make") == 1
      end,
    },
  },
  keys = {
    { "<leader>ff", "<cmd>Telescope find_files<cr>", desc = "Find files" },
    { "<leader>fg", "<cmd>Telescope live_grep<cr>", desc = "Live grep" },
    { "<leader>fb", "<cmd>Telescope buffers<cr>", desc = "Buffers" },
    { "<leader>fh", "<cmd>Telescope help_tags<cr>", desc = "Help tags" },
    { "<leader>fd", "<cmd>Telescope diagnostics<cr>", desc = "Diagnostics" },
  },
  config = function()
    local telescope = require("telescope")
    telescope.setup({
      pickers = {
        -- <leader>fb: most-recently-used first, hide the current buffer ->
        -- the file you just left sits at the top, ready to <CR>.
        buffers = {
          sort_mru = true,
          ignore_current_buffer = true,
        },
      },
    })
    pcall(telescope.load_extension, "fzf") -- only if the native lib built
  end,
}
