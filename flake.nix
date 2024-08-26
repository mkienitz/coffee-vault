{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    devshell = {
      url = "github:numtide/devshell";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs = inputs @ {
    flake-parts,
    devshell,
    nixpkgs,
    ...
  }:
    flake-parts.lib.mkFlake
    {inherit inputs;}
    {
      imports = [
        inputs.devshell.flakeModule
      ];
      flake = {
      };
      systems = [
        "aarch64-linux"
        "aarch64-darwin"
        "x86_64-linux"
        "x86_64-darwin"
      ];
      perSystem = {pkgs, ...}: {
        formatter = pkgs.alejandra;
        devshells.default = {
          packages = with pkgs; [
            nil
            sqlite
            nodejs
            nodePackages."@tailwindcss/language-server"
            nodePackages.npm
            nodePackages.tailwindcss
            nodePackages.typescript-language-server
            nodePackages.svelte-language-server
          ];
          env = [
            {
              name = "COFFEE_VAULT_DB_PATH";
              value = "./sqlite.db";
            }
          ];
        };
      };
    };
}
