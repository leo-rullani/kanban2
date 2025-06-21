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
 * Updates the UI with the filtered requests or a message if none are found.
 */
function renderRequestList() {
    let htmltext = "";
    let searchInput = document.getElementById("request_search");
    let searchValue = searchInput ? searchInput.value.trim().toLowerCase() : "";
    let filteredRequests = requestList.filter(req => req.title && req.title.toLowerCase().includes(searchValue));
    filteredRequests.forEach(req => {
        htmltext += getRequestListEntryTemplate(req);
    });
    if(filteredRequests.length <= 0){
        htmltext = `<h3 class="font_prime_color">...No requests available...</h3>`;
    }
    document.getElementById("request_list").innerHTML = htmltext;
}

/**
 * Returns the HTML template for a single request entry in the request list.
 * @param {Object} request - The request object containing request details.
 * @returns {string} The HTML string representing the request entry.
 */
function getRequestListEntryTemplate(request) {
    return `<li class="card d_flex_sc_gl w_full">
                <h3>${request.title || "Untitled"}</h3>
                <div class="request_list_entry_part d_flex_sc_gs">
                    <img src="../../assets/icons/user_icon.svg" alt="">
                    <p class="fs_m">${request.assignee_count || "-"}</p>
                    <p>Assignees</p>
                </div>
                <div class="request_list_entry_part d_flex_sc_gs">
                    <img src="../../assets/icons/calendar_icon.svg" alt="">
                    <p class="fs_m">${request.due_date || "-"}</p>
                    <p>Due</p>
                </div>
            </li>`;
}