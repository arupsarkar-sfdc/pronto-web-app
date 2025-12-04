export async function fetchToken(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching token:", error);
        throw error;
    }
}

export async function fetchDataGraph(accessToken, sourceRecordId) {
    try {
        const lookupKeys = `UnifiedLinkssotIndividualI1__dlm.SourceRecordId__c=${sourceRecordId}`;
        const queryParams = new URLSearchParams({
            lookupKeys: `[${lookupKeys}]`
        });

        // Using the proxy path /api which redirects to https://mnrw0zbyh0yt0mldmmytqzrxg0.c360a.salesforce.com/api
        const url = `/api/v1/dataGraph/C360_Contact_RT?${queryParams.toString()}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching data graph:", error);
        throw error;
    }
}
