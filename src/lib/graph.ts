import { Client } from "@microsoft/microsoft-graph-client";

export function getGraphClient(accessToken: string): Client {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
}

export async function searchUsers(client: Client, query: string) {
  const result = await client
    .api("/users")
    .filter(
      `startswith(displayName,'${query}') or startswith(mail,'${query}') or startswith(userPrincipalName,'${query}')`
    )
    .select("id,displayName,mail,userPrincipalName,accountEnabled,assignedLicenses")
    .top(10)
    .get();
  return result.value;
}

export async function getUser(client: Client, userId: string) {
  return client
    .api(`/users/${userId}`)
    .select(
      "id,displayName,mail,userPrincipalName,accountEnabled,assignedLicenses,assignedPlans"
    )
    .get();
}

export async function getUserLicenses(client: Client, userId: string) {
  return client.api(`/users/${userId}/licenseDetails`).get();
}

export async function removeUserLicenses(
  client: Client,
  userId: string,
  skuIds: string[]
) {
  return client.api(`/users/${userId}/assignLicense`).post({
    addLicenses: [],
    removeLicenses: skuIds,
  });
}

export async function convertToSharedMailbox(
  client: Client,
  userPrincipalName: string
) {
  const response = await client
    .api(`/users/${userPrincipalName}/mailboxSettings`)
    .get();
  return response;
}

export async function addMailboxPermission(
  client: Client,
  mailboxUserId: string,
  delegateEmail: string
) {
  return client
    .api(`/users/${mailboxUserId}/mailFolders/inbox/permissions`)
    .post({
      emailAddress: {
        address: delegateEmail,
      },
      isInsideOrganization: true,
      role: "editor",
    });
}

export async function getUserOneDriveItems(client: Client, userId: string) {
  return client
    .api(`/users/${userId}/drive/root/children`)
    .select("id,name,size,lastModifiedDateTime,folder,file")
    .get();
}

export async function copyToSharePoint(
  client: Client,
  userId: string,
  userName: string,
  siteUrl: string,
  driveItemId: string,
  itemName: string
) {
  const siteDomain = new URL(siteUrl).hostname;
  const sitePath = new URL(siteUrl).pathname;
  const site = await client
    .api(`/sites/${siteDomain}:${sitePath}`)
    .get();

  const drives = await client.api(`/sites/${site.id}/drives`).get();
  const documentLibrary = drives.value[0];

  let targetFolder;
  try {
    targetFolder = await client
      .api(`/drives/${documentLibrary.id}/root:/${userName}`)
      .get();
  } catch {
    targetFolder = await client
      .api(`/drives/${documentLibrary.id}/root/children`)
      .post({
        name: userName,
        folder: {},
        "@microsoft.graph.conflictBehavior": "rename",
      });
  }

  return client
    .api(`/users/${userId}/drive/items/${driveItemId}/copy`)
    .post({
      parentReference: {
        driveId: documentLibrary.id,
        id: targetFolder.id,
      },
      name: itemName,
    });
}

export async function breakInheritanceAndSetPermissions(
  client: Client,
  siteUrl: string,
  userName: string,
  allowedUserEmails: string[]
) {
  const siteDomain = new URL(siteUrl).hostname;
  const sitePath = new URL(siteUrl).pathname;
  const site = await client
    .api(`/sites/${siteDomain}:${sitePath}`)
    .get();

  const drives = await client.api(`/sites/${site.id}/drives`).get();
  const documentLibrary = drives.value[0];

  const folder = await client
    .api(`/drives/${documentLibrary.id}/root:/${userName}`)
    .get();

  const permissions = await client
    .api(`/drives/${documentLibrary.id}/items/${folder.id}/permissions`)
    .get();

  for (const perm of permissions.value) {
    if (perm.id) {
      try {
        await client
          .api(
            `/drives/${documentLibrary.id}/items/${folder.id}/permissions/${perm.id}`
          )
          .delete();
      } catch {
      }
    }
  }

  const recipients = allowedUserEmails.map((email) => ({
    email,
  }));

  if (recipients.length > 0) {
    await client
      .api(`/drives/${documentLibrary.id}/items/${folder.id}/invite`)
      .post({
        requireSignIn: true,
        sendInvitation: false,
        roles: ["read"],
        recipients,
      });
  }

  return { success: true, folder: userName, permissionsSet: allowedUserEmails };
}

export async function getSiteLibraries(client: Client, siteUrl: string) {
  const siteDomain = new URL(siteUrl).hostname;
  const sitePath = new URL(siteUrl).pathname;
  const site = await client
    .api(`/sites/${siteDomain}:${sitePath}`)
    .get();

  const drives = await client.api(`/sites/${site.id}/drives`).get();
  return drives.value;
}

export async function addSiteLibraryPermission(
  client: Client,
  siteUrl: string,
  libraryId: string,
  userEmail: string,
  role: "read" | "write" | "owner"
) {
  const siteDomain = new URL(siteUrl).hostname;
  const sitePath = new URL(siteUrl).pathname;
  const site = await client
    .api(`/sites/${siteDomain}:${sitePath}`)
    .get();

  return client.api(`/sites/${site.id}/drives/${libraryId}/root/invite`).post({
    requireSignIn: true,
    sendInvitation: false,
    roles: [role],
    recipients: [{ email: userEmail }],
  });
}
