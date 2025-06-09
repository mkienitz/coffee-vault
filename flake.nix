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
        ./nix/module.nix
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
        {
          pkgs,
          config,
          lib,
          ...
        }:
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
                value = "./db.sqlite";
              }
              {
                name = "COFFEE_VAULT_DOMAIN";
                value = "coffee.maxkienitz.com";
              }
            ];
          };

          pre-commit.settings.hooks.treefmt.enable = true;

          packages.default = pkgs.buildNpmPackage {
            pname = "coffee-vault";
            version = "0.0.5";
            src = ./.;
            npmDepsHash = "sha256-X5T6YRFEWnm3tdCjy8CUF5sOz99LppSCyO12i+WPJ5U=";
            nativeBuildInputs = [ pkgs.makeWrapper ];
            installPhase = ''
              runHook preInstall
              mkdir -p $out/bin $out/share
              cp -R build node_modules $out/share/
              makeWrapper ${lib.getExe pkgs.nodejs_22} $out/bin/coffee-vault \
                --add-flags $out/share/build
              runHook postInstall
            '';
            meta = {
              description = "A manager for frozen coffee";
              mainProgram = "coffee-vault";
            };
          };

          overlayAttrs.coffee-vault = config.packages.default;

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
