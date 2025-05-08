
# bun x openapi-typescript http://localhost:2999/swagger/json --output generated/openapi.ts
# bun x openapi-typescript http://localhost:3004/swagger/json --output generated/openapi_geolocation.ts

import os

os.system("bun x openapi-typescript http://localhost:2999/swagger/json --output generated/openapi.ts")
os.system("bun x openapi-typescript http://localhost:3004/swagger/json --output generated/openapi_geolocation.ts")
