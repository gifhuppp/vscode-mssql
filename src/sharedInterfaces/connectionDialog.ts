/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscodeMssql from "vscode-mssql";
import {
    FormItemSpec,
    FormContextProps,
    FormState,
    FormReducers,
} from "../reactviews/common/forms/form";
import { ApiStatus } from "./webview";

export class ConnectionDialogWebviewState
    implements
        FormState<
            IConnectionDialogProfile,
            ConnectionDialogWebviewState,
            ConnectionDialogFormItemSpec
        >
{
    /** the underlying connection profile for the form target; same as `connectionProfile` */
    formState: IConnectionDialogProfile = {} as IConnectionDialogProfile;
    /** The underlying connection profile for the form target; a more intuitively-named alias for `formState` */
    get connectionProfile(): IConnectionDialogProfile {
        return this.formState;
    }
    set connectionProfile(value: IConnectionDialogProfile) {
        this.formState = value;
    }

    formComponents: Partial<Record<keyof IConnectionDialogProfile, ConnectionDialogFormItemSpec>> =
        {};

    public selectedInputMode: ConnectionInputMode = ConnectionInputMode.Parameters;
    public connectionComponents: ConnectionComponentsInfo = {
        mainOptions: [],
        topAdvancedOptions: [],
        groupedAdvancedOptions: [],
    };
    public azureSubscriptions: AzureSubscriptionInfo[] = [];
    public azureServers: AzureSqlServerInfo[] = [];
    public savedConnections: IConnectionDialogProfile[] = [];
    public recentConnections: IConnectionDialogProfile[] = [];
    public connectionStatus: ApiStatus = ApiStatus.NotStarted;
    public formError: string = "";
    public loadingAzureSubscriptionsStatus: ApiStatus = ApiStatus.NotStarted;
    public loadingAzureServersStatus: ApiStatus = ApiStatus.NotStarted;
    public dialog: IDialogProps | undefined;

    constructor(params?: Partial<ConnectionDialogWebviewState>) {
        for (const key in params) {
            if (key in this) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- safe due to key in this check being a Partial of the class
                (this as any)[key as keyof ConnectionDialogWebviewState] =
                    params[key as keyof ConnectionDialogWebviewState]!;
            }
        }
    }
}

export interface IDialogProps {
    type: "trustServerCert" | "addFirewallRule";
}

export interface TrustServerCertDialogProps extends IDialogProps {
    type: "trustServerCert";
    message: string;
}

export interface AddFirewallRuleDialogProps extends IDialogProps {
    type: "addFirewallRule";
    message: string;
    clientIp: string;
    tenants: { name: string; id: string }[];
}

export interface AzureSubscriptionInfo {
    name: string;
    id: string;
    loaded: boolean;
}

export interface AzureSqlServerInfo {
    server: string;
    databases: string[];
    location: string;
    resourceGroup: string;
    subscription: string;
}

export interface ConnectionComponentsInfo {
    mainOptions: (keyof IConnectionDialogProfile)[];
    topAdvancedOptions: (keyof IConnectionDialogProfile)[];
    groupedAdvancedOptions: ConnectionComponentGroup[];
}

export interface ConnectionComponentGroup {
    groupName: string;
    options: (keyof IConnectionDialogProfile)[];
}

export interface ConnectionDialogFormItemSpec
    extends FormItemSpec<
        IConnectionDialogProfile,
        ConnectionDialogWebviewState,
        ConnectionDialogFormItemSpec
    > {
    isAdvancedOption: boolean;
    optionCategory?: string;
    optionCategoryLabel?: string;
}

export enum ConnectionInputMode {
    Parameters = "parameters",
    ConnectionString = "connectionString",
    AzureBrowse = "azureBrowse",
}

// A Connection Profile contains all the properties of connection credentials, with additional
// optional name and details on whether password should be saved
export interface IConnectionDialogProfile extends vscodeMssql.IConnectionInfo {
    profileName?: string;
    savePassword?: boolean;
    emptyPasswordInput?: boolean;
    azureAuthType?: vscodeMssql.AzureAuthType;
    /** display name for the MRU pane; should be set to the profileName if available, otherwise generated from connection details */
    displayName?: string;
}

export interface ConnectionDialogContextProps
    extends FormContextProps<
        IConnectionDialogProfile,
        ConnectionDialogWebviewState,
        ConnectionDialogFormItemSpec
    > {
    loadConnection: (connection: IConnectionDialogProfile) => void;
    setConnectionInputType: (inputType: ConnectionInputMode) => void;
    connect: () => void;
    loadAzureServers: (subscriptionId: string) => void;
    closeDialog: () => void;
    addFirewallRule: (
        name: string,
        tenantId: string,
        ip: string | { startIp: string; endIp: string },
    ) => void;
    filterAzureSubscriptions: () => void;
    refreshConnectionsList: () => void;
    deleteSavedConnection(connection: IConnectionDialogProfile): void;
    removeRecentConnection(connection: IConnectionDialogProfile): void;
}

export enum AuthenticationType {
    SqlLogin = "SqlLogin",
    Integrated = "Integrated",
    AzureMFA = "AzureMFA",
}

export interface ConnectionDialogReducers extends FormReducers<IConnectionDialogProfile> {
    setConnectionInputType: {
        inputMode: ConnectionInputMode;
    };
    loadConnection: {
        connection: IConnectionDialogProfile;
    };
    connect: {};
    loadAzureServers: {
        subscriptionId: string;
    };
    addFirewallRule: {
        name: string;
        tenantId: string;
        ip: string | { startIp: string; endIp: string };
    };
    closeDialog: {};
    filterAzureSubscriptions: {};
    refreshConnectionsList: {};
    deleteSavedConnection: {
        connection: IConnectionDialogProfile;
    };
    removeRecentConnection: {
        connection: IConnectionDialogProfile;
    };
}
