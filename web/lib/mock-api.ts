export interface MockUser {
  id: number;
  name: string;
  username: string;
  role: string;
  active: boolean;
}

export interface MockPost {
  id: number;
  userId: number;
  title: string;
  views: number;
}

const INITIAL_USERS: MockUser[] = [
  { id: 1, name: "Ada Lovelace", username: "ada", role: "admin", active: true },
  { id: 2, name: "Alan Turing", username: "alan", role: "engineer", active: true },
  { id: 3, name: "Grace Hopper", username: "grace", role: "admiral", active: false },
  { id: 4, name: "Dennis Ritchie", username: "dmr", role: "creator", active: false },
];

const INITIAL_POSTS: MockPost[] = [
  { id: 1, userId: 1, title: "First Algorithm", views: 1843 },
  { id: 2, userId: 2, title: "On Computable Numbers", views: 1936 },
  { id: 3, userId: 3, title: "The First Compiler", views: 1952 },
];

let users: MockUser[] = JSON.parse(JSON.stringify(INITIAL_USERS));
let posts: MockPost[] = JSON.parse(JSON.stringify(INITIAL_POSTS));

export function resetMockData() {
  users = JSON.parse(JSON.stringify(INITIAL_USERS));
  posts = JSON.parse(JSON.stringify(INITIAL_POSTS));
}

export interface MockResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
}

export function handleMockRequest(
  method: string,
  urlPath: string,
  data?: unknown,
  params?: Record<string, string>,
): MockResponse {
  const normMethod = method.toUpperCase();
  // Strip origin if present
  let path = urlPath.replace(/^https?:\/\/[^/]+/i, "");
  if (!path.startsWith("/")) path = `/${path}`;

  const [pathname, search] = path.split("?");
  const searchParams = new URLSearchParams(search || "");
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      searchParams.set(k, v);
    }
  }

  // Easter egg / Intentional errors
  if (pathname === "/error/500") {
    return {
      status: 500,
      statusText: "Internal Server Error",
      headers: { "content-type": "application/json" },
      data: { error: "Simulated server failure" },
    };
  }
  if (pathname === "/error/401") {
    return {
      status: 401,
      statusText: "Unauthorized",
      headers: { "content-type": "application/json" },
      data: { error: "Missing or invalid credentials" },
    };
  }
  if (pathname === "/error/403") {
    return {
      status: 403,
      statusText: "Forbidden",
      headers: { "content-type": "application/json" },
      data: { error: "Insufficient permissions" },
    };
  }

  // OPTIONS
  if (normMethod === "OPTIONS") {
    return {
      status: 200,
      statusText: "OK",
      headers: {
        allow: "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS",
        "content-type": "text/plain",
      },
      data: "Allow: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS",
    };
  }

  // HEAD
  if (normMethod === "HEAD") {
    return {
      status: 200,
      statusText: "OK",
      headers: {
        "content-type": "application/json",
        "x-mock-api": "usr-in-memory",
      },
      data: null,
    };
  }

  // USERS collection
  if (pathname === "/users") {
    if (normMethod === "GET") {
      let filtered = [...users];
      const activeFilter = searchParams.get("active");
      if (activeFilter !== null) {
        const boolVal = activeFilter === "true";
        filtered = filtered.filter((u) => u.active === boolVal);
      }
      return {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        data: filtered,
      };
    }
    if (normMethod === "POST") {
      const body =
        typeof data === "string"
          ? JSON.parse(data)
          : (data as Record<string, unknown>) || {};
      const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
      const newUser: MockUser = {
        id: newId,
        name: String(body.name || "Anonymous"),
        username: String(body.username || `user${newId}`),
        role: String(body.role || "user"),
        active: body.active !== undefined ? Boolean(body.active) : true,
      };
      users.push(newUser);
      return {
        status: 201,
        statusText: "Created",
        headers: { "content-type": "application/json" },
        data: newUser,
      };
    }
  }

  // USERS item
  const userMatch = pathname.match(/^\/users\/(\d+)$/);
  if (userMatch) {
    const id = parseInt(userMatch[1], 10);
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      return {
        status: 404,
        statusText: "Not Found",
        headers: { "content-type": "application/json" },
        data: { error: `User ${id} not found` },
      };
    }

    if (normMethod === "GET") {
      return {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        data: users[index],
      };
    }

    if (normMethod === "PUT") {
      const body =
        typeof data === "string"
          ? JSON.parse(data)
          : (data as Record<string, unknown>) || {};
      users[index] = {
        id,
        name: String(body.name || users[index].name),
        username: String(body.username || users[index].username),
        role: String(body.role || users[index].role),
        active: body.active !== undefined ? Boolean(body.active) : users[index].active,
      };
      return {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        data: users[index],
      };
    }

    if (normMethod === "PATCH") {
      const body =
        typeof data === "string"
          ? JSON.parse(data)
          : (data as Record<string, unknown>) || {};
      users[index] = {
        ...users[index],
        ...body,
        id, // id stays invariant
      };
      return {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        data: users[index],
      };
    }

    if (normMethod === "DELETE") {
      const deleted = users.splice(index, 1)[0];
      return {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        data: { message: `User ${id} deleted`, user: deleted },
      };
    }
  }

  // POSTS collection
  if (pathname === "/posts") {
    if (normMethod === "GET") {
      return {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        data: posts,
      };
    }
  }

  // 404 fallback
  return {
    status: 404,
    statusText: "Not Found",
    headers: { "content-type": "application/json" },
    data: { error: `Route ${normMethod} ${pathname} not found` },
  };
}
