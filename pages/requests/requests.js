/**
 * The base URL for request-related API calls.
 * @type {string}
 */
const REQUESTS_URL = API_BASE_URL + "requests/";

/**
 * Array storing the list of requests.
 * @type {Array}
 */
let requestList = [];

/**
 * Asynchronously fetches the list of requests and renders them if available.
 * Updates the global requestList variable.
 * @returns {Promise<void>}
 */
async function getAndRenderRequestList() {
    requestList = await getRequests();
    if(requestList) {
        renderRequestList();
    }
}

/**
 * Asynchronously fetches the list of requests from the backend API.
 * @returns {Promise<Array>} Returns an array of requests if successful, otherwise an empty array.
 */
async function getRequests() {
    let reqResp = await getData(REQUESTS_URL);
    if (reqResp && reqResp.ok) {
        return reqResp.data;
    } else {
        return [];
    }
}

/**
 * Renders the list of requests filtered by the current search input.
 * Updates the UI by filling the request table body or displaying a placeholder row.
 */
function renderRequestList() {
    let htmltext = "";
    let searchInput = document.getElementById("request_search");
    let searchValue = searchInput ? searchInput.value.trim().toLowerCase() : "";
    let filteredRequests = requestList.filter(req => req.title && req.title.toLowerCase().includes(searchValue));

    if(filteredRequests.length <= 0){
        htmltext = `<tr><td colspan="14" class="font_prime_color text_center">...No requests available...</td></tr>`;
    } else {
        filteredRequests.forEach(req => {
            htmltext += getRequestListEntryTemplate(req);
        });
    }

    document.getElementById("request_list").innerHTML = htmltext;
}

/**
 * Returns the HTML template for a single request entry as a table row.
 * Includes all relevant columns matching the table header.
 * @param {Object} request - The request object containing request details.
 * @returns {string} The HTML string representing the request row.
 */
function getRequestListEntryTemplate(request) {
    return `<tr>
                <td>${request.date || "-"}</td>
                <td>${request.function || "-"}</td>
                <td>${request.project || "-"}</td>
                <td>${request.meeting_point || "-"}</td>
                <td>${request.vehicle_out || "-"}</td>
                <td>${request.start || "-"}</td>
                <td>${request.end || "-"}</td>
                <td>${request.vehicle_return || "-"}</td>
                <td>${request.location || "-"}</td>
                <td>${request.hotel || "-"}</td>
                <td>${request.shuttle || "-"}</td>
                <td>${request.status || "-"}</td>
                <td>${request.deployment_location || "-"}</td>
                <td>${request.order_number || "-"}</td>
            </tr>`;
}