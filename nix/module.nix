{
  flake =
    {
      config,
      ...
    }:
    let
      flakeConfig = config;
    in
    {
      nixosModules.coffee-vault =
        {
          config,
          lib,
          pkgs,
          ...
        }:
        let
          inherit (lib)
            mkOption
            mkEnableOption
            mkPackageOption
            types
            mkIf
            ;
          cfg = config.services.coffee-vault;
        in
        {
          options.services.coffee-vault = {
            enable = mkEnableOption "coffee-vault";
            package = mkPackageOption pkgs "coffee-vault" { };
            address = mkOption {
              description = "Address to listen on";
              type = types.str;
              default = "127.0.0.1";
              example = "[::1]";
            };
            port = mkOption {
              description = "Port to listen on";
              type = types.port;
              default = 8000;
            };
            workingDirectory = mkOption {
              description = "Path to working directory";
              type = types.str;
              default = "/var/lib/coffee-vault";
            };
            domain = mkOption {
              description = ''
                Domain the application is hosted on.
                The physical NFC tags need a matching domain.
              '';
              type = types.str;
            };
          };
          config = mkIf cfg.enable {
            nixpkgs.overlays = [
              flakeConfig.overlays.default
            ];
            users = {
              users.coffee-vault = {
                group = "coffee-vault";
                isSystemUser = true;
                home = cfg.workingDirectory;
                shell = "/sbin/nologin";
              };
              groups.coffee-vault = { };
            };
            systemd.services.coffee-vault = {
              description = "coffee-vault";
              after = [
                "network.target"
              ];
              wantedBy = [ "multi-user.target" ];
              serviceConfig = {
                ExecStart = lib.getExe cfg.package;
                User = "coffee-vault";
                Group = "coffee-vault";
                DynamicUser = false;
                WorkingDirectory = cfg.workingDirectory;
                StateDirectory = "coffee-vault";
                StateDirectoryMode = "0750";
                Restart = "on-failure";
              };
              environment = {
                HOST = cfg.address;
                PORT = toString cfg.port;
                ORIGIN = "https://${cfg.domain}";
                COFFEE_VAULT_DB_PATH = "${cfg.workingDirectory}/db.sqlite";
              };
            };
          };
        };
      nixosModules.default = config.nixosModules.coffee-vault;
    };
}
