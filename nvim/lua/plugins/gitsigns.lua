-- Git change signs in the gutter + hunk preview/stage/reset + line blame.
-- See :help gitsigns-functions for the full action list.
return {
  "lewis6991/gitsigns.nvim",
  event = { "BufReadPre", "BufNewFile" },
  opts = {
    -- Faint "who last touched this line" virtual text at end of the current
    -- line, following the cursor. Toggle with :Gitsigns toggle_current_line_blame.
    current_line_blame = true,
    current_line_blame_opts = {
      delay = 300,
      virt_text_pos = "eol",
    },
  },
  keys = {
    -- Detailed popup for the current line (full commit message + hunk).
    {
      "<leader>gb",
      function()
        require("gitsigns").blame_line({ full = true })
      end,
      desc = "Blame line (popup)",
    },
    -- Full-file blame in a side window.
    { "<leader>gB", "<cmd>Gitsigns blame<cr>", desc = "Blame file (window)" },
  },
}
