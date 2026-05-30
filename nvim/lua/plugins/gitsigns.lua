-- Git change signs in the gutter + hunk preview/stage/reset.
-- See :help gitsigns-functions for the full action list.
return {
  "lewis6991/gitsigns.nvim",
  event = { "BufReadPre", "BufNewFile" },
  opts = {}, -- empty opts == setup() with defaults
}
