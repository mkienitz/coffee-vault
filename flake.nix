{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    devshell = {
      url = "github:numtide/devshell";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    pre-commit-hooks = {
      url = "github:cachix/pre-commit-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs =
    inputs@{
      flake-parts,
      devshell,
      ...
    }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        inputs.devshell.flakeModule
        inputs.flake-parts.flakeModules.easyOverlay
        inputs.pre-commit-hooks.flakeModule
        inputs.treefmt-nix.flakeModule
      ];
      flake = {
      };
      systems = [
        "aarch64-linux"
        "aarch64-darwin"
        "x86_64-linux"
        "x86_64-darwin"
      ];
      perSystem =
        { pkgs, config, ... }:
        {
          devshells.default = {
            devshell.startup.pre-commit.text = config.pre-commit.installationScript;
            packages = with pkgs; [
              nil
              sqlite
              nodejs_22
              nodePackages."@tailwindcss/language-server"
              nodePackages.tailwindcss
              nodePackages.typescript-language-server
              nodePackages.svelte-language-server
            ];
            env = [
              {
                name = "COFFEE_VAULT_DB_PATH";
                value = "./sqlite.db";
              }
              {
                name = "COFFEE_VAULT_BQL_PRINT_ADDRESS";
                value = "192.168.178.32";
              }
              {
                name = "COFFEE_VAULT_BQL_PRINT_PORT";
                value = "10001";
              }
              {
                name = "COFFEE_VAULT_DOMAIN";
                value = "coffee.maxkienitz.com";
              }
            ];
          };
          pre-commit.settings.hooks.treefmt.enable = true;

          treefmt = {
            projectRootFile = "flake.nix";
            programs = {
              deadnix.enable = true;
              statix.enable = true;
              nixfmt.enable = true;
              prettier.enable = true;
            };
          };
        };
    };
}
