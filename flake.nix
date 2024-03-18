{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    devshell = {
      url = "github:numtide/devshell";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs = {
    flake-utils,
    devshell,
    nixpkgs,
    ...
  }:
    flake-utils.lib.eachDefaultSystem
    (
      system: let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [
            devshell.overlays.default
          ];
        };
      in {
        formatter = pkgs.alejandra;
        devShells.default = pkgs.devshell.mkShell {
          packages = with pkgs; [
            nil
            nodejs
            nodePackages."@tailwindcss/language-server"
            nodePackages.npm
            nodePackages.tailwindcss
            nodePackages.typescript-language-server
            nodePackages.svelte-language-server
          ];
        };
      }
    );
}
