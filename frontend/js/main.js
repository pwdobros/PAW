import { ApiError, createTask, deleteTask, fetchTasks } from "./api.js";
import {
  hideFormError,
  hideListStatus,
  renderTasks,
  renderTotal,
  showFormError,
  showListError,
  showListLoading,
} from "./ui.js";

const form = document.querySelector("#task-form");
const reloadButton = document.querySelector("#reload-button");
const submitButton = document.querySelector("#submit-button");
const taskList = document.querySelector("#task-list");
const statusFilter = document.querySelector("#status-filter");

function describeError(error) {
  if (error instanceof ApiError) {
    return `Serwer odrzucił żądanie (${error.status}): ${error.message}`;
  }
  return "Brak połączenia z API. Sprawdź, czy serwer działa.";
}

async function loadTasks() {
  showListLoading();
  try {
    const { items, totalHeader } = await fetchTasks(statusFilter.value);
    renderTasks(items);
    renderTotal(totalHeader);
    hideListStatus();
  } catch (error) {
    showListError(describeError(error));
    renderTotal(null);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideFormError();
  const data = new FormData(form);
  submitButton.disabled = true;
  try {
    await createTask({
      title: data.get("title"),
      priority: data.get("priority"),
    });
    form.reset();
    await loadTasks();
  } catch (error) {
    showFormError(describeError(error));
  } finally {
    submitButton.disabled = false;
  }
});

taskList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action='delete']");
  if (button === null) {
    return;
  }
  const taskItem = button.closest(".task");
  const taskId = taskItem.dataset.id;
  button.disabled = true;
  try {
    await deleteTask(taskId);
    await loadTasks();
  } catch (error) {
    showListError(describeError(error));
    button.disabled = false;
  }
});

statusFilter.addEventListener("change", loadTasks);
reloadButton.addEventListener("click", loadTasks);

loadTasks();
