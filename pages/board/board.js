/**
 * Stores the currently selected board object.
 * @type {Object}
 */
let currentBoard = {}

/**
 * Stores the currently selected task object.
 * @type {Object|undefined}
 */
let currentTask

/**
 * Stores the current comments for the selected task or board.
 * @type {Array|undefined}
 */
let currentComments

/**
 * Indicates whether the Shift key is currently pressed.
 * @type {boolean}
 */
let isShiftPressed = false

/**
 * Stores the list of current board members.
 * @type {Array|undefined}
 */
let currentMemberList

/**
 * Sets the isShiftPressed flag to true if the Shift key is pressed.
 *
 * Typically used in keydown event listeners to detect multi-line input
 * or modifier key usage.
 *
 * @param {KeyboardEvent} event - The keyboard event object.
 */
function setShift(event) {
    if (event.keyCode == 16) isShiftPressed = true;
}

/**
 * Resets the isShiftPressed flag to false when the Shift key is released.
 *
 * Typically used in keyup event listeners to track modifier key state.
 *
 * @param {KeyboardEvent} event - The keyboard event object.
 */
function unsetShift(event) {
    if (event.keyCode == 16) isShiftPressed = false;
}

/**
 * Initializes the currentTask object to default values.
 *
 * Use this to reset the task state before creating or editing a task.
 * Sets all properties to null except priority, which is set to 'medium'.
 */
function cleanCurrentTask() {
    currentTask = {
        "id": null,
        "title": null,
        "description": null,
        "status": null,
        "priority": 'medium',
        "assignee": null,
        "reviewer": null,
        "due_date": null
    }
}

/**
 * Initializes the board view on page load.
 *
 * Loads the current board data, resets the currentTask object,
 * renders all tasks and members, updates the board title,
 * and (if a task_id URL parameter is present) opens the task detail dialog.
 *
 * Typically called once when the page is loaded.
 *
 * @returns {Promise<void>} Resolves when initialization is complete.
 */
async function init() {
    await setBoard()
    cleanCurrentTask()
    renderAllTasks()
    renderMemberList()
    renderTitle()
    if(getParamFromUrl("task_id")) openTaskDetailDialog(getParamFromUrl("task_id"))
}

/**
 * Updates the board title in the DOM.
 *
 * Sets the inner text of the elements with IDs 'board_title_link' and 'board_title'
 * to the current board's title.
 */
function renderTitle() {
    document.getElementById('board_title_link').innerText = currentBoard.title
    document.getElementById('board_title').innerText = currentBoard.title
}

/**
 * Fetches the board data for the current page and updates the currentBoard object.
 *
 * Uses the board ID from the URL parameters and retrieves the board data from the API.
 * If the request is successful, updates the global currentBoard variable.
 *
 * @returns {Promise<void>} Resolves when the board data is loaded.
 */
async function setBoard() {
    let boardResp = await getData(BOARDS_URL + getParamFromUrl("id"))
    if (boardResp.ok) {
        currentBoard = boardResp.data
    }
}

/**
 * Renders the list of board member profile circles in the DOM.
 *
 * Inserts the generated HTML from getMemberListTemplate(currentBoard)
 * into the element with the ID 'short_profile_list'.
 */
function renderMemberList() {
    let listRef = document.getElementById('short_profile_list')
    listRef.innerHTML = getMemberListTemplate(currentBoard)
}

/**
 * Opens the detail dialog for a specific task.
 *
 * Sets the currentTask to a deep copy of the task with the given ID,
 * switches the current dialog to "task_detail_dialog",
 * opens the dialog wrapper, and loads the detailed task data.
 *
 * @param {number|string} id - The unique identifier of the task to display.
 * @returns {Promise<void>} Resolves when the detail task data is loaded.
 */
async function openTaskDetailDialog(id) {
    currentTask = JSON.parse(JSON.stringify(getTaskById(id)))
    changeCurrentDialog("task_detail_dialog")
    toggleOpenId('dialog_wrapper')
    await loadAndRenderDetailTask(id)
}

/**
 * Loads the comments for the specified task and renders the task details in the dialog.
 *
 * Updates the global currentComments variable and refreshes the task detail view.
 *
 * @param {number|string} id - The unique identifier of the task.
 * @returns {Promise<void>} Resolves when comments are loaded and task details are rendered.
 */
async function loadAndRenderDetailTask(id) {
    currentComments = await getTaskComments(id)
    renderDetailTask()
}

/**
 * Renders the details of the current task in the detail dialog.
 *
 * Updates all relevant DOM elements with the current task's status, title,
 * description, assignee, reviewer, due date, priority, and comments.
 */
function renderDetailTask() {
    document.getElementById('task_detail_dialog_select').value = currentTask.status
    document.getElementById('detail_task_title').innerHTML = currentTask.title
    document.getElementById('detail_task_description').innerHTML = currentTask.description
    document.getElementById('detail_task_assignee').innerHTML = getDetailTaskPersonTemplate(currentTask.assignee)
    document.getElementById('detail_task_reviewer').innerHTML = getDetailTaskPersonTemplate(currentTask.reviewer)
    renderDetailTaskDueDate()
    renderDetailTaskPriority()
    renderDetailTaskComments()
}

/**
 * Renders the priority badge and label for the current task in the detail dialog.
 *
 * Updates the element with ID 'detail_task_priority' with a visual badge
 * and the current task's priority level.
 */
function renderDetailTaskPriority() {
    let prioRef = document.getElementById('detail_task_priority')
    prioRef.innerHTML = `<div priority="${currentTask.priority}" class="priority-badge"></div><p >${currentTask.priority}</p>`
}

/**
 * Renders the due date for the current task in the detail dialog.
 *
 * Updates the element with ID 'detail_task_due_date' to display the current task's due date.
 */
function renderDetailTaskDueDate() {
    let prioRef = document.getElementById('detail_task_due_date')
    prioRef.innerHTML = currentTask.due_date
}

/**
 * Fetches the comments for a specific task by its ID.
 *
 * Sends a GET request to the task comments endpoint. If successful,
 * returns the array of comment objects. Otherwise, returns an empty array.
 *
 * @param {number|string} id - The unique identifier of the task.
 * @returns {Promise<Array>} Promise resolving to an array of comment objects.
 */
async function getTaskComments(id) {
    let commentResp = await getData(TASKS_URL + id + "/comments/")
    if (commentResp.ok) {
        return commentResp.data
    } else {
        return []
    }
}

/**
 * Handles the keyup event in the comment textarea.
 *
 * If the Enter key (keyCode 13) is pressed without the Shift key,
 * submits the comment by calling postComment().
 *
 * @param {KeyboardEvent} event - The keyboard event object.
 * @param {HTMLElement} element - The textarea element containing the comment.
 */
async function sendComment(event, element) {
    if (event.keyCode == 13 && !isShiftPressed) {
        postComment(element)
    }
}

/**
 * Submits the comment entered in the comment textarea directly.
 *
 * Retrieves the textarea element by its ID and calls postComment() to submit its content.
 *
 * @returns {Promise<void>}
 */
async function sendCommentDirectly() {
    let element = document.getElementById('comment_textarea')
    postComment(element)
}

/**
 * Submits a new comment for the current task.
 *
 * If the textarea contains content, sends a POST request to the comments endpoint.
 * On success, clears the textarea, reloads the comments, and updates the UI.
 * If the request fails, displays error messages.
 *
 * @param {HTMLTextAreaElement} element - The textarea element containing the comment text.
 * @returns {Promise<void>}
 */
async function postComment(element) {
    let newComment = {
        "content": element.value.trim()
    }
    if (newComment.content.length > 0) {
        let response = await postData(TASKS_URL + currentTask.id + "/comments/", newComment)
        if (!response.ok) {
            let errorArr = extractErrorMessages(response.data)
            showToastMessage(true, errorArr)
        } else {
            element.value = ''
            currentComments = await getTaskComments(currentTask.id)
            renderDetailTaskComments()
        }
    }
}

/**
 * Renders all comments for the current task in the detail dialog.
 *
 * Updates the sender profile with the current user's initials,
 * and populates the comment list with all comments using getSingleCommmentTemplate().
 */
function renderDetailTaskComments() {
    let userInitials = getInitials(getAuthFullname())
    document.getElementById('comment_sender_profile').innerHTML = `<div class="profile_circle color_${userInitials[0]}">${userInitials}</div>`;
    let listRef = document.getElementById("task_comment_list")
    let listHtml = "";
    currentComments.forEach(comment => {
        listHtml += getSingleCommmentTemplate(comment)
    });
    listRef.innerHTML = listHtml;
}

/**
 * Opens the dialog to create a new task.
 *
 * Resets the currentTask object, sets the task status if provided (defaults to "to-do"),
 * switches the current dialog to the task creation dialog, and fills the form fields.
 *
 * @param {string} [status] - (Optional) The status to assign to the new task (e.g., "to-do", "in-progress").
 */
function openCreateTaskDialog(status) {
    cleanCurrentTask()
    if (status) {
        currentTask.status = status
    } else {
        currentTask.status = "to-do"
    }
    changeCurrentDialog("create_edit_task_dialog")
    toggleOpenId('dialog_wrapper')
    fillEditCreateTaskDialog('create')
}

/**
 * Opens the dialog to edit the currently selected task.
 *
 * Switches the current dialog to the task edit dialog and populates the form fields with the current task's data.
 */
function openEditTaskDialog() {
    changeCurrentDialog("create_edit_task_dialog")
    fillEditCreateTaskDialog('edit')
}

/**
 * Deletes the currently selected task by its ID.
 *
 * Calls the deleteTask function with the current task's ID.
 */
function deleteCurrentTask() {
    deleteTask(currentTask.id)
}

function deleteComment(id) {
    deleteData(TASKS_URL + currentTask.id + "/comments/" + id + "/").then(async response => {
        if (!response.ok) {
            let errorArr = extractErrorMessages(response.data)
            showToastMessage(true, errorArr)
        } else {
            currentComments = await getTaskComments(currentTask.id);
            renderDetailTaskComments()
        }
    })
}

/**
 * Deletes a comment by its ID for the current task.
 *
 * Sends a DELETE request to the task comments endpoint.
 * If successful, reloads the comments and updates the UI.
 * If the request fails, displays error messages.
 *
 * @param {number|string} id - The unique identifier of the comment to delete.
 */
function deleteComment(id) {
    deleteData(TASKS_URL + currentTask.id + "/comments/" + id + "/").then(async response => {
        if (!response.ok) {
            let errorArr = extractErrorMessages(response.data)
            showToastMessage(true, errorArr)
        } else {
            currentComments = await getTaskComments(currentTask.id)
            renderDetailTaskComments()
        }
    })
}

/**
 * Populates the task create/edit dialog with the appropriate data and settings.
 *
 * Sets the dialog type attribute, fills the title and description fields,
 * renders the member dropdowns, updates the priority dropdown header,
 * and sets the status selection.
 *
 * @param {string} type - The dialog mode, either "create" or "edit".
 */
function fillEditCreateTaskDialog(type) {
    document.getElementById("create_edit_task_dialog").setAttribute('dialog-type', type)
    fillCreateEditTaskTitleInputDesc()
    renderTaskCreateMemberList()
    setTaskCreateDropdownPrioHeader()
    setSelectAddEditTaskStatusDropdown()
}

/**
 * Renders the member dropdown lists for assignee and reviewer in the task create/edit dialog.
 *
 * Populates the dropdowns with current board members and updates the dropdown headers for both roles.
 */
function renderTaskCreateMemberList() {
    document.getElementById("create_edit_task_assignee").innerHTML = getTaskCreateMemberListEntrieTemplate("assignee", currentBoard)
    document.getElementById("create_edit_task_reviewer").innerHTML = getTaskCreateMemberListEntrieTemplate("reviewer", currentBoard)
    setTaskCreateDropdownHeader('assignee')
    setTaskCreateDropdownHeader('reviewer')
}

/**
 * Updates the dropdown header for the assignee or reviewer in the task dialog.
 *
 * If a member is assigned, displays their initials and name;
 * otherwise, shows a default user icon and "unassigned" label.
 *
 * @param {string} type - Either "assignee" or "reviewer".
 */
function setTaskCreateDropdownHeader(type) {
    let headRef = document.getElementById(`create_edit_task_${type}_head`)
    if (currentTask[type]) {
        let initials = getInitials(currentTask[type].fullname)
        headRef.innerHTML = `<div class="profile_circle color_${initials[0]}">${initials}</div><p>${currentTask[type].fullname}</p>`
    } else {
        headRef.innerHTML = `<img src="../../assets/icons/face_icon.svg" alt=""><p>unassigned</p>`
    }
}

/**
 * Unassigns the specified member role (assignee or reviewer) for the current task.
 *
 * Sets the role to null and updates the dropdown header in the task dialog.
 *
 * @param {string} type - The member type to unset ("assignee" or "reviewer").
 */
function unsetMemberAs(type) {
    currentTask[type] = null
    setTaskCreateDropdownHeader(type)
}

/**
 * Assigns a board member as either the assignee or reviewer for the current task.
 *
 * Finds the member by their ID, updates the currentTask object,
 * and updates the corresponding dropdown header.
 *
 * @param {number|string} memberId - The unique identifier of the member.
 * @param {string} type - The member type to set ("assignee" or "reviewer").
 */
function setMemberAs(memberId, type) {
    currentTask[type] = getMemberById(memberId)
    setTaskCreateDropdownHeader(type)
}

/**
 * Finds and returns a member object from the current board by their ID.
 *
 * @param {number|string} id - The unique identifier of the member.
 * @returns {Object|undefined} The member object if found, otherwise undefined.
 */
function getMemberById(id) {
    return currentBoard.members.find(member => member.id == id)
}

/**
 * Finds and returns a task object from the current board by its ID.
 *
 * @param {number|string} id - The unique identifier of the task.
 * @returns {Object|undefined} The task object if found, otherwise undefined.
 */
function getTaskById(id) {
    return currentBoard.tasks.find(task => task.id == id)
}

/**
 * Sets the priority for the current task and updates the priority dropdown header.
 *
 * @param {string} prio - The priority level to assign (e.g., "low", "medium", "high").
 */
function setTaskCreatePrio(prio) {
    currentTask.priority = prio
    setTaskCreateDropdownPrioHeader()
}

/**
 * Updates the priority dropdown header in the task create/edit dialog.
 *
 * Displays the current priority badge and label based on the currentTask's priority.
 */
function setTaskCreateDropdownPrioHeader() {
    let headerRef = document.getElementById('create_edit_task_prio_head')
    headerRef.innerHTML = `<div class="priority-badge" priority="${currentTask.priority}"></div><p>${currentTask.priority}</p>`
}

/**
 * Sets the due date for the current task from the provided input element.
 *
 * @param {HTMLInputElement} element - The input element containing the selected due date.
 */
function setTaskCreateDate(element) {
    currentTask.due_date = element.value
}

/**
 * Switches the visible dialog by updating the 'current_dialog' attribute.
 *
 * Sets all dialogs with the 'current_dialog' attribute to 'false',
 * then sets the specified dialog's attribute to 'true' to make it active.
 *
 * @param {string} currentDialog - The ID of the dialog to activate.
 */
function changeCurrentDialog(currentDialog) {
    const dialogs = document.querySelectorAll('[current_dialog]')
    dialogs.forEach(dialog => {
        dialog.setAttribute('current_dialog', 'false')
    })
    document.getElementById(currentDialog).setAttribute('current_dialog', 'true')
}

/**
 * Validates the task title input for minimum length.
 *
 * Checks if the trimmed value of the input has more than 2 characters.
 * Updates the error state accordingly.
 *
 * @param {HTMLInputElement} element - The input element for the task title.
 * @returns {boolean} True if the title is valid, false otherwise.
 */
function validateCreateEditTaskTitle(element) {
    let valid = element.value.trim().length > 2
    setError(!valid, element.id + "_group")
    return valid
}

/**
 * Validates that a due date has been selected for the task.
 *
 * Checks if the trimmed value of the input is not empty.
 * Updates the error state accordingly.
 *
 * @param {HTMLInputElement} element - The input element for the due date.
 * @returns {boolean} True if a due date is set, false otherwise.
 */
function validateCreateEditTaskDueDate(element) {
    let valid = element.value.trim().length > 0
    setError(!valid, element.id + "_group")
    return valid
}

/**
 * Handles the submission of the create task form.
 *
 * Prevents the default form submission, validates the input fields,
 * and if valid, calls createTask() to create the new task.
 *
 * @param {Event} event - The form submission event.
 * @returns {Promise<void>}
 */
async function submitCreateTask(event) {
    event.preventDefault()
    let newTask = getValidatedTask()
    if (newTask) {
        await createTask(newTask)
    }
}

/**
 * Validates the input fields in the create/edit task dialog and constructs a task object if valid.
 *
 * Checks the title and due date fields for validity.
 * If both are valid, returns a new task object with all relevant properties.
 * If validation fails, returns false.
 *
 * @returns {Object|boolean} The new or updated task object if valid, otherwise false.
 */
function getValidatedTask() {
    let titleRef = document.getElementById('create_edit_task_title_input')
    let dateRef = document.getElementById('create_edit_task_date_input')
    if (validateCreateEditTaskTitle(titleRef) && validateCreateEditTaskDueDate(dateRef)) {
        let updatedTask = {
            "board": currentBoard.id,
            "title": titleRef.value,
            "description": document.getElementById('create_edit_task_description').value,
            "status": currentTask.status,
            "priority": currentTask.priority,
            "reviewer_id": currentTask.reviewer ? currentTask.reviewer.id : null,
            "assignee_id": currentTask.assignee ? currentTask.assignee.id : null,
            "due_date": dateRef.value
        }
        return updatedTask
    }
    return false
}

/**
 * Handles the submission of the edit task form.
 *
 * Validates the input fields and, if valid, updates the current task
 * by calling editTask() with the new values.
 *
 * @returns {Promise<void>}
 */
async function submitEditTask() {
    let updatedTask = getValidatedTask()
    if (updatedTask) {
        await editTask(updatedTask, currentTask.id)
    }
}

/**
 * Sends an update request to the API to edit the task with the given ID.
 *
 * If the update is successful, resets the current task, closes the dialog,
 * and reloads all tasks. If the request fails, displays error messages.
 *
 * @param {Object} updatedTask - The task object containing updated values.
 * @param {number|string} id - The unique identifier of the task to update.
 * @returns {Promise<void>}
 */
async function editTask(updatedTask, id) {
    let response = await patchData(TASKS_URL + id + "/", updatedTask)
    if (!response.ok) {
        let errorArr = extractErrorMessages(response.data)
        showToastMessage(true, errorArr)
    } else {
        cleanCurrentTask()
        toggleOpenId('dialog_wrapper')
        await loadAndRenderTasks()
    }
}

/**
 * Sends a request to the API to create a new task.
 *
 * If the creation is successful, resets the current task, closes the dialog,
 * and reloads all tasks. If the request fails, displays error messages.
 *
 * @param {Object} newTask - The task object to be created.
 * @returns {Promise<void>}
 */
async function createTask(newTask) {
    let response = await postData(TASKS_URL, newTask)
    if (!response.ok) {
        let errorArr = extractErrorMessages(response.data)
        showToastMessage(true, errorArr)
    } else {
        cleanCurrentTask()
        toggleOpenId('dialog_wrapper')
        await loadAndRenderTasks()
    }
}

/**
 * Sets the value of the status dropdown in the create/edit task dialog
 * to match the current task's status.
 */
function setSelectAddEditTaskStatusDropdown() {
    document.getElementById('create_edit_task_dialog_select').value = currentTask.status
}

/**
 * Updates the current task's status based on the selected value in the status dropdown.
 */
function modifyAddEditTaskStatusDropdown() {
    let status = document.getElementById('create_edit_task_dialog_select').value
    currentTask.status = status
}

/**
 * Updates the current task's status using the status selected in the task detail dialog.
 *
 * Calls modifyTaskStatus with the current task's ID and the selected status value.
 *
 * @returns {Promise<void>}
 */
async function modifyTaskStatusDropdown() {
    let status = document.getElementById('task_detail_dialog_select').value
    await modifyTaskStatus(currentTask.id, status)
}

/**
 * Sends a PATCH request to update the status of a task with the given ID.
 *
 * If the update is successful, reloads all tasks.
 * If the request fails, displays error messages.
 *
 * @param {number|string} id - The unique identifier of the task to update.
 * @param {string} status - The new status to assign to the task.
 * @returns {Promise<void>}
 */
async function modifyTaskStatus(id, status) {
    let response = await patchData(TASKS_URL + id + "/", {"status": status})
    if (!response.ok) {
        let errorArr = extractErrorMessages(response.data)
        showToastMessage(true, errorArr)
    } else {
        await loadAndRenderTasks()
    }
}

/**
 * Toggles the visibility of the move button dropdown for a task card.
 *
 * Closes all other move dropdowns, then opens or closes the one for the given element.
 *
 * @param {HTMLElement} element - The move button element to toggle.
 */
function toggleMoveOpen(element) {
    resetAllMoveOpen()
    let isOpen = element.getAttribute('move-open') === 'true'
    element.setAttribute('move-open', !isOpen)
}

/**
 * Closes all move button dropdowns by setting their 'move-open' attribute to 'false'.
 *
 * Useful to ensure only one move dropdown is open at a time on the board.
 */
function resetAllMoveOpen() {
    document.querySelectorAll('.move_btn').forEach(btn => btn.setAttribute('move-open', 'false'))
}

/**
 * Aborts the create/edit task process and closes the dialog.
 *
 * Resets the currentTask object, clears the form fields,
 * and closes the create/edit task dialog.
 */
function abbortCreateEditTask() {
    cleanCurrentTask()
    fillCreateEditTaskTitleInputDesc()
    toggleOpenId('dialog_wrapper')
}

/**
 * Fills the task create/edit dialog fields with the current task's title, due date, and description.
 *
 * Populates the corresponding input elements with the values from currentTask.
 */
function fillCreateEditTaskTitleInputDesc() {
    document.getElementById('create_edit_task_title_input').value = currentTask.title
    document.getElementById('create_edit_task_date_input').value = currentTask.due_date
    document.getElementById('create_edit_task_description').value = currentTask.description
}

/**
 * Loads the latest board data and renders all tasks in the UI.
 *
 * Fetches the board data from the API and updates the task lists.
 *
 * @returns {Promise<void>}
 */
async function loadAndRenderTasks() {
    await setBoard()
    renderAllTasks()
}

/**
 * Renders all tasks on the board, optionally filtering by the search input value.
 *
 * If the search bar has input, only tasks matching the search are rendered.
 * Otherwise, all tasks are shown, grouped by status columns.
 */
function renderAllTasks() {
    let searchRef = document.getElementById('searchbar_tasks')
    let taskList = []
    if (searchRef.value.length > 0) {
        taskList = searchInTasks(searchRef.value)
    } else {
        taskList = currentBoard.tasks
    }
    let statii = ['to-do', 'in-progress', 'review', 'done']
    statii.forEach(status => {
        let filteredList = taskList.filter(task => task.status == status)
        renderSingleColumn(status, filteredList)
    })
}

/**
 * Renders a single Kanban column for a given status with the provided list of tasks.
 *
 * Clears the column and then appends each task using getBoardCardTemplate().
 *
 * @param {string} status - The status of the column (e.g., "to-do", "in-progress", "review", "done").
 * @param {Array<Object>} filteredList - The list of task objects to display in the column.
 */
function renderSingleColumn(status, filteredList) {
    document.getElementById(`${status}_column`).innerHTML = ""
    filteredList.forEach(task => {
        document.getElementById(`${status}_column`).innerHTML += getBoardCardTemplate(task)
    })
}

/**
 * Searches for tasks in the current board that match the given search term in their title or description.
 *
 * Performs a case-insensitive search.
 *
 * @param {string} searchTerm - The term to search for.
 * @returns {Array<Object>} Array of task objects matching the search term.
 */
function searchInTasks(searchTerm) {
    const lowerCaseSearch = searchTerm.toLowerCase()

    return currentBoard.tasks.filter(task => {
        const titleMatch = task.title?.toLowerCase().includes(lowerCaseSearch)
        const descriptionMatch = task.description?.toLowerCase().includes(lowerCaseSearch)
        return titleMatch || descriptionMatch
    })
}

/**
 * Sends a PATCH request to update the board settings (e.g., title) for the current board.
 *
 * If the update is successful, updates the current board title and re-renders it.
 * If the request fails, displays error messages.
 *
 * @param {Object} data - The updated board data to send to the API.
 * @returns {Promise<Object>} The API response object.
 */
async function updateBoard(data) {
    let response = await patchData(BOARDS_URL + currentSettingsBoard.id + "/", data)
    if (!response.ok) {
        let errorArr = extractErrorMessages(response.data)
        showToastMessage(true, errorArr)
    } else {
        currentBoard.title = response.data.title
        renderTitle()
    }
    return response
}

/**
 * Deletes the current board using the API and handles UI updates.
 *
 * If the deletion is successful, redirects to the boards page.
 * If the request fails, displays error messages.
 * Always clears any persistent toast notifications.
 *
 * @returns {Promise<void>}
 */
async function deleteBoard() {
    let response = await deleteData(BOARDS_URL + currentSettingsBoard.id + "/")
    if(response.ok){
        window.location.href = "../../pages/boards/"
    } else {
        let errorArr = extractErrorMessages(response.data)
        showToastMessage(true, errorArr)
    }
    deleteLastingToast()
}

/**
 * Opens the native date picker for the specified input element.
 *
 * Finds the element by its ID and calls showPicker() on its next sibling (the date input).
 *
 * @param {string} element - The ID of the reference element preceding the date input.
 */
function triggerDateInput(element) {
    document.getElementById(element).nextElementSibling.showPicker()
}

/**
 * Opens the board settings dialog for editing the current board.
 *
 * Sets the dialog's current_dialog attribute to "true" and loads the board settings.
 *
 * @returns {Promise<void>}
 */
async function openEditBoardDialog() {
    document.getElementById("edit_board_dialog").setAttribute("current_dialog", "true")
    openBoardSettingsDialog(currentBoard.id)
}