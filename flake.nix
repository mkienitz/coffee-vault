{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    devshell = {
      url = "github:numtide/devshell";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    git-hooks = {
      url = "github:cachix/git-hooks.nix";
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
      ...
    }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        inputs.devshell.flakeModule
        inputs.flake-parts.flakeModules.easyOverlay
        inputs.git-hooks.flakeModule
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
            packages = [
              pkgs.nil
              pkgs.sqlite
              pkgs.nodejs_26
              pkgs.tailwindcss-language-server
              pkgs.tailwindcss
              pkgs.typescript-language-server
              pkgs.svelte-language-server
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
            inherit ((lib.importJSON ./package.json)) version;
            src = ./.;
            npmDepsHash = "sha256-CwAeAyr2FYAogqwQ6li19Zk648wMBdEoCE8SppnXY+U=";
            nativeBuildInputs = [ pkgs.makeWrapper ];
            installPhase = ''
              runHook preInstall
              mkdir -p $out/bin $out/share
              cp -R build node_modules server.mjs $out/share/
              makeWrapper ${lib.getExe pkgs.nodejs_26} $out/bin/coffee-vault \
                --add-flags $out/share/server.mjs
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
