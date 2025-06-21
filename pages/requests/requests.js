// ---- requests.js ----

const REQUESTS_URL = API_BASE_URL + "requests/";

let requestList = [];

async function getAndRenderRequestList() {
    requestList = await getRequests();
    if(requestList) {
        renderRequestList();
    }
}

async function getRequests() {
    let reqResp = await getData(REQUESTS_URL);
    if (reqResp && reqResp.ok) {
        return reqResp.data;
    } else {
        return [];
    }
}

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

// ---- ENDE requests.js ----
