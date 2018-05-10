export function buildProfileItem(profileItems = []) {
    let profile = {};
    if (profileItems && profileItems.length > 0) {
        profileItems.forEach((profileItem) => {
            profile[profileItem.Tag] = profileItem.Value;
        });
    }
    return profile;
}
