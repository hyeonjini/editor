import type { Script } from "@/entities/script";

const now = new Date().toISOString();

export const sampleScript: Script = {
  id: "script_sample",
  name: "Sample HTTP Load Script",
  description: "Initial scaffold sample script",
  httpSettings: {
    baseUrl: "https://example.com",
    timeoutMs: 5000,
    followRedirects: true,
    defaultHeaders: [{ key: "Accept", value: "application/json", enabled: true }],
    cookiePolicy: "inherit",
    connectionReuse: true,
  },
  transactions: [
    {
      id: "txn_1",
      name: "Prepare",
      steps: [
        {
          id: "data_1",
          type: "data",
          name: "basePath",
          dataType: "string",
          value: "/api",
        },
        {
          id: "req_1",
          type: "request",
          name: "Get Users",
          method: "GET",
          url: {
            kind: "template",
            template: "{{basePath}}/users",
            references: [
              {
                nodeId: "data_1",
                sourceType: "data-node",
                path: "value",
              },
            ],
          },
          headers: [],
          queryParams: [],
          pathParams: [],
        },
      ],
    },
    {
      id: "txn_2",
      name: "Parallel Calls",
      steps: [
        {
          id: "group_1",
          type: "request-group",
          name: "Parallel Detail Requests",
          requests: [
            {
              id: "req_2",
              type: "request",
              name: "Get Profile",
              method: "GET",
              url: {
                kind: "static",
                value: "/api/profile",
              },
              headers: [],
              queryParams: [],
              pathParams: [],
            },
            {
              id: "req_3",
              type: "request",
              name: "Get Settings",
              method: "GET",
              url: {
                kind: "static",
                value: "/api/settings",
              },
              headers: [],
              queryParams: [],
              pathParams: [],
            },
          ],
        },
      ],
    },
  ],
  createdAt: now,
  updatedAt: now,
};
