const list = document.querySelector("#repository-list");
const status = document.querySelector("#repository-status");

function isRepository(repository) {
  if (
    !repository
    || typeof repository.name !== "string"
    || typeof repository.description !== "string"
    || typeof repository.url !== "string"
    || typeof repository.starredAt !== "string"
    || !/^\d{4}-\d{2}-\d{2}$/.test(repository.starredAt)
  ) {
    return false;
  }

  const date = new Date(`${repository.starredAt}T00:00:00Z`);
  return !Number.isNaN(date.getTime())
    && date.toISOString().slice(0, 10) === repository.starredAt;
}

function renderRepositories(repositories) {
  list.replaceChildren();

  for (const repository of repositories) {
    const item = document.createElement("li");
    item.className = "repository";

    const link = document.createElement("a");
    link.href = repository.url;
    link.textContent = repository.name;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const description = document.createElement("p");
    description.textContent = repository.description;

    const starredAt = document.createElement("time");
    starredAt.dateTime = repository.starredAt;
    starredAt.textContent = `Starred on ${new Date(`${repository.starredAt}T00:00:00`).toLocaleDateString()}`;

    item.append(link, description, starredAt);
    list.append(item);
  }

  status.textContent = repositories.length
    ? `${repositories.length} starred ${repositories.length === 1 ? "repository" : "repositories"}`
    : "No starred repositories found.";
}

async function loadRepositories() {
  try {
    const response = await fetch("./events.json");
    if (!response.ok) {
      throw new Error(`Unable to load repositories (${response.status}).`);
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.repositories) || !data.repositories.every(isRepository)) {
      throw new Error("Repository data has an invalid format.");
    }

    renderRepositories(data.repositories);
  } catch (error) {
    status.setAttribute("role", "alert");
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    status.textContent = `Could not load starred repositories: ${message}`;
  }
}

loadRepositories();
