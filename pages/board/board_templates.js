/**
 * Generates the HTML for the board member profile circles list.
 *
 * Shows up to 4 member initials. If there are more than 4 members,
 * displays a "+X" indicator for the remaining members.
 *
 * @param {Object} currentBoard - The board object containing members.
 * @param {Array} currentBoard.members - Array of member objects with a 'fullname' property.
 * @returns {string} HTML string for rendering the member profile circles.
 */
function getMemberListTemplate(currentBoard) {
    let listHTML = "";
    for (let i = 0; i < currentBoard.members.length; i++) {
        if (i >= 4) {
            listHTML += `<li><div class="profile_circle  color_A">+${currentBoard.members.length - 4}</div></li>`;
            break;
        }
        listHTML += `<li><div class="profile_circle  color_${getInitials(currentBoard.members[i].fullname)[0]}">${getInitials(currentBoard.members[i].fullname)}</div></li>`;
    }
    return listHTML;
}

/**
 * Returns the HTML template for displaying a task member (assignee or reviewer).
 *
 * If a member is provided, shows their initials in a profile circle and their full name.
 * If no member is provided, shows a default user icon and the label "unassigned".
 *
 * @param {Object|null} member - The member object with a 'fullname' property, or null if unassigned.
 * @returns {string} HTML string representing the member or an "unassigned" placeholder.
 */
function getDetailTaskPersonTemplate(member) {
    if (member) {
        return `<div class="profile_circle color_${getInitials(member.fullname)[0]}">${getInitials(member.fullname)}</div>
                <p>${member.fullname}</p>`;
    } else {
        return `<img src="../../assets/icons/face_icon.svg" alt="">
                <p>unassigned</p>`;
    }
}

/**
 * Generates the HTML template for a single comment in the comment list.
 *
 * Displays the author's initials, name, time since creation, and comment content.
 * If the comment was authored by the current user, includes a delete button.
 *
 * @param {Object} comment - The comment object.
 * @param {number} comment.id - The unique identifier for the comment.
 * @param {string} comment.author - Full name of the comment author.
 * @param {string} comment.created_at - ISO date string representing when the comment was created.
 * @param {string} comment.content - The comment text content.
 * @returns {string} HTML string representing a single comment entry.
 */
function getSingleCommmentTemplate(comment) {
    let delete_btn = comment.author == getAuthFullname() ? `<img src="../../assets/icons/delete.svg" class="delete_btn" alt="" onclick="deleteComment(${comment.id})">` : "";
    let userInitials = getInitials(comment.author);
    return `        <article class="comment_wrapper d_flex_ss_gm w_full">
                        <div class="profile_circle color_${userInitials[0]}">${userInitials}</div>
                        <div class="d_flex_sc_gs f_d_c w_full">
                            <header class="d_flex_sc_gm w_full d_sb">
                                <div class="d_flex_sc_gm">
                                    <h4>${comment.author}</h4>
                                    <p>${timeDifference(comment.created_at)}</p>
                                </div>
                                ${delete_btn}
                            </header>
                            <p class="w_full">${comment.content}</p>
                        </div>    
                    </article>`;
}

/**
 * Generates the HTML for the dropdown list of potential assignees or reviewers when creating or editing a task.
 *
 * The first entry allows the user to unset the member ("unassigned"), followed by all board members.
 * Clicking an entry will set (or unset) the corresponding member and close the dropdown.
 *
 * @param {string} type - Either "assignee" or "reviewer"; determines which role the member is being assigned to.
 * @param {Object} currentBoard - The current board object containing a members array.
 * @param {Array} currentBoard.members - Array of member objects, each with a 'fullname' and 'id' property.
 * @returns {string} HTML string for the member dropdown entries.
 */
function getTaskCreateMemberListEntrieTemplate(type, currentBoard) {
    let listHtml = `<li onclick="unsetMemberAs('${type}'); toggleDropdown(this, event)">
                        <img src="../../assets/icons/face_icon.svg" alt="">
                        <p>unassigned</p>
                    </li>`;
    currentBoard.members.forEach(member => {
        listHtml += `<li onclick="setMemberAs('${member.id}', '${type}'); toggleDropdown(this, event)">
                        <div class="profile_circle color_${getInitials(member.fullname)[0]}">${getInitials(member.fullname)}</div>
                        <p>${member.fullname}</p>
                    </li>`;
    });

    return listHtml;
}

/**
 * Generates the HTML template for a task card on the Kanban board column.
 *
 * Displays the task's title, priority icon, assignee (profile circle or default icon),
 * description, and the move button.
 * Clicking the card opens the task detail dialog.
 *
 * @param {Object} task - The task object.
 * @param {number} task.id - The unique identifier of the task.
 * @param {string} task.title - The title of the task.
 * @param {string} task.description - The description of the task.
 * @param {Object|null} task.assignee - The assignee object, or null if unassigned.
 * @param {string} [task.assignee.fullname] - Full name of the assignee (if present).
 * @param {string} task.priority - Priority level (e.g., "high", "medium", "low").
 * @returns {string} HTML string representing the task card in the board column.
 */
function getBoardCardTemplate(task) {
    let assignee_html = task.assignee ?
        `<div class="profile_circle color_${getInitials(task.assignee.fullname)[0]}">${getInitials(task.assignee.fullname)}</div>` :
        `<img src="../../assets/icons/face_icon.svg" alt="">`;
    return `            <li class="column_card" onclick="openTaskDetailDialog(${task.id})">
                            <header class="column_card_header">
                                <h4 class="font_white_color">${task.title}</h4>
                                <div class="d_flex_sc_gm">
                                    <img src="../../assets/icons/${task.priority}_prio_colored.svg" alt="">
                                    ${assignee_html}
                                </div>
                            </header>
                            <p class="column_card_content font_white_color">${task.description}</p>
                            ${getBoardCardMoveBtnTemplate(task)}
                        </li>`;
}

/**
 * Generates the HTML template for the move button group of a board task card.
 *
 * Provides buttons to move a task to the previous or next status (e.g., "to-do", "in-progress", "review", "done").
 * The current status is determined, and only valid moves are shown.
 *
 * @param {Object} task - The task object.
 * @param {number} task.id - The unique identifier for the task.
 * @param {string} task.status - The current status of the task.
 * @returns {string} HTML string representing the move button dropdown for the task card.
 */
function getBoardCardMoveBtnTemplate(task) {
    let statii = ['to-do', 'in-progress', 'review', 'done'];
    let currentStatusIndex = statii.indexOf(task.status);
    let moveBtns = "";
    if (currentStatusIndex > 0) {
        moveBtns += `<button onclick="modifyTaskStatus(${task.id}, '${statii[currentStatusIndex-1]}')">${statii[currentStatusIndex-1]}<img class="rotate_half" src="../../assets/icons/arrow_forward.svg" alt="" srcset=""></button>`;
    }
    if (currentStatusIndex < statii.length - 1) {
        moveBtns += `<button onclick="modifyTaskStatus(${task.id}, '${statii[currentStatusIndex+1]}')">${statii[currentStatusIndex+1]} <img src="../../assets/icons/arrow_forward.svg" alt="" srcset=""></button>`;
    }

    return `<div move-open="false" class="move_btn" onclick="toggleMoveOpen(this); stopProp(event)">
        <img src="../../assets/icons/swap_horiz.svg" alt="">
        <div class=" d_flex_sc_gs f_d_c pad_s">
            <p class="font_prime_color ">Move to</p>
            ${moveBtns}
        </div>
    </div>`;
}