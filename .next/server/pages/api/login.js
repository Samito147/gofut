"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/api/login";
exports.ids = ["pages/api/login"];
exports.modules = {

/***/ "@supabase/supabase-js":
/*!****************************************!*\
  !*** external "@supabase/supabase-js" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require("@supabase/supabase-js");

/***/ }),

/***/ "bcrypt":
/*!*************************!*\
  !*** external "bcrypt" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("bcrypt");

/***/ }),

/***/ "cookie":
/*!*************************!*\
  !*** external "cookie" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("cookie");

/***/ }),

/***/ "jsonwebtoken":
/*!*******************************!*\
  !*** external "jsonwebtoken" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("jsonwebtoken");

/***/ }),

/***/ "next/dist/compiled/next-server/pages-api.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages-api.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/pages-api.runtime.dev.js");

/***/ }),

/***/ "(api)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Flogin&preferredRegion=&absolutePagePath=.%2Fpages%5Capi%5Clogin.js&middlewareConfigBase64=e30%3D!":
/*!****************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Flogin&preferredRegion=&absolutePagePath=.%2Fpages%5Capi%5Clogin.js&middlewareConfigBase64=e30%3D! ***!
  \****************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   config: () => (/* binding */ config),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   routeModule: () => (/* binding */ routeModule)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/pages-api/module.compiled */ \"(api)/./node_modules/next/dist/server/future/route-modules/pages-api/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(api)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/build/templates/helpers */ \"(api)/./node_modules/next/dist/build/templates/helpers.js\");\n/* harmony import */ var _pages_api_login_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pages\\api\\login.js */ \"(api)/./pages/api/login.js\");\n\n\n\n// Import the userland code.\n\n// Re-export the handler (should be the default export).\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_pages_api_login_js__WEBPACK_IMPORTED_MODULE_3__, \"default\"));\n// Re-export config.\nconst config = (0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_pages_api_login_js__WEBPACK_IMPORTED_MODULE_3__, \"config\");\n// Create and export the route module that will be consumed.\nconst routeModule = new next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__.PagesAPIRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.PAGES_API,\n        page: \"/api/login\",\n        pathname: \"/api/login\",\n        // The following aren't used in production.\n        bundlePath: \"\",\n        filename: \"\"\n    },\n    userland: _pages_api_login_js__WEBPACK_IMPORTED_MODULE_3__\n});\n\n//# sourceMappingURL=pages-api.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LXJvdXRlLWxvYWRlci9pbmRleC5qcz9raW5kPVBBR0VTX0FQSSZwYWdlPSUyRmFwaSUyRmxvZ2luJnByZWZlcnJlZFJlZ2lvbj0mYWJzb2x1dGVQYWdlUGF0aD0uJTJGcGFnZXMlNUNhcGklNUNsb2dpbi5qcyZtaWRkbGV3YXJlQ29uZmlnQmFzZTY0PWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDTDtBQUMxRDtBQUNtRDtBQUNuRDtBQUNBLGlFQUFlLHdFQUFLLENBQUMsZ0RBQVEsWUFBWSxFQUFDO0FBQzFDO0FBQ08sZUFBZSx3RUFBSyxDQUFDLGdEQUFRO0FBQ3BDO0FBQ08sd0JBQXdCLGdIQUFtQjtBQUNsRDtBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxZQUFZO0FBQ1osQ0FBQzs7QUFFRCIsInNvdXJjZXMiOlsid2VicGFjazovL2dvZnV0LWZ1bi8/YWM0YSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQYWdlc0FQSVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvcGFnZXMtYXBpL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IGhvaXN0IH0gZnJvbSBcIm5leHQvZGlzdC9idWlsZC90ZW1wbGF0ZXMvaGVscGVyc1wiO1xuLy8gSW1wb3J0IHRoZSB1c2VybGFuZCBjb2RlLlxuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi4vcGFnZXNcXFxcYXBpXFxcXGxvZ2luLmpzXCI7XG4vLyBSZS1leHBvcnQgdGhlIGhhbmRsZXIgKHNob3VsZCBiZSB0aGUgZGVmYXVsdCBleHBvcnQpLlxuZXhwb3J0IGRlZmF1bHQgaG9pc3QodXNlcmxhbmQsIFwiZGVmYXVsdFwiKTtcbi8vIFJlLWV4cG9ydCBjb25maWcuXG5leHBvcnQgY29uc3QgY29uZmlnID0gaG9pc3QodXNlcmxhbmQsIFwiY29uZmlnXCIpO1xuLy8gQ3JlYXRlIGFuZCBleHBvcnQgdGhlIHJvdXRlIG1vZHVsZSB0aGF0IHdpbGwgYmUgY29uc3VtZWQuXG5leHBvcnQgY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgUGFnZXNBUElSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuUEFHRVNfQVBJLFxuICAgICAgICBwYWdlOiBcIi9hcGkvbG9naW5cIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9sb2dpblwiLFxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGFyZW4ndCB1c2VkIGluIHByb2R1Y3Rpb24uXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcIlwiXG4gICAgfSxcbiAgICB1c2VybGFuZFxufSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBhZ2VzLWFwaS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(api)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Flogin&preferredRegion=&absolutePagePath=.%2Fpages%5Capi%5Clogin.js&middlewareConfigBase64=e30%3D!\n");

/***/ }),

/***/ "(api)/./pages/api/login.js":
/*!****************************!*\
  !*** ./pages/api/login.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"@supabase/supabase-js\");\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var bcrypt__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! bcrypt */ \"bcrypt\");\n/* harmony import */ var bcrypt__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(bcrypt__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jsonwebtoken */ \"jsonwebtoken\");\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(jsonwebtoken__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var cookie__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! cookie */ \"cookie\");\n/* harmony import */ var cookie__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(cookie__WEBPACK_IMPORTED_MODULE_3__);\n// pages/api/login.js\n\n\n\n\n// Inicia cliente Supabase com a Service Key\nconst supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);\nasync function handler(req, res) {\n    if (req.method !== \"POST\") {\n        res.setHeader(\"Allow\", \"POST\");\n        return res.status(405).json({\n            error: \"S\\xf3 POST permitido\"\n        });\n    }\n    const { usernameOrEmail, password } = req.body;\n    if (!usernameOrEmail || !password) {\n        return res.status(400).json({\n            error: \"Preencha todos os campos.\"\n        });\n    }\n    // 1️⃣ Busca usuário por username ou email, incluindo a role\n    const { data, error } = await supabase.from(\"users\").select(\"id,password_hash,username,role\").or(`username.eq.${usernameOrEmail},email.eq.${usernameOrEmail}`).single();\n    if (error || !data) {\n        return res.status(401).json({\n            error: \"Credenciais inv\\xe1lidas\"\n        });\n    }\n    // 2️⃣ Compara senha\n    const match = await bcrypt__WEBPACK_IMPORTED_MODULE_1___default().compare(password, data.password_hash);\n    if (!match) {\n        return res.status(401).json({\n            error: \"Credenciais inv\\xe1lidas\"\n        });\n    }\n    // 3️⃣ Busca a role mais atualizada do auth.users\n    let finalRole = data.role;\n    try {\n        const { data: sbUser, error: sbError } = await supabase.auth.admin.getUserById(data.id);\n        if (!sbError && sbUser.user.raw_user_meta_data?.role) {\n            finalRole = sbUser.user.raw_user_meta_data.role;\n        }\n    } catch (e) {\n        console.error(\"Erro ao buscar metadata de role:\", e);\n    }\n    // 4️⃣ Sucesso — gera JWT incluindo a role e configura cookie HttpOnly\n    const token = jsonwebtoken__WEBPACK_IMPORTED_MODULE_2___default().sign({\n        userId: data.id,\n        username: data.username,\n        role: finalRole // <-- usa a role atualizada\n    }, process.env.JWT_SECRET, {\n        expiresIn: \"2h\"\n    });\n    res.setHeader(\"Set-Cookie\", (0,cookie__WEBPACK_IMPORTED_MODULE_3__.serialize)(\"auth_token\", token, {\n        httpOnly: true,\n        secure: \"development\" === \"production\",\n        sameSite: \"strict\",\n        path: \"/\",\n        maxAge: 60 * 60 * 2\n    }));\n    return res.status(200).json({\n        message: \"Logado!\",\n        userId: data.id\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9wYWdlcy9hcGkvbG9naW4uanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUJBQXFCO0FBRStCO0FBQ3pCO0FBQ0c7QUFDSTtBQUVsQyw0Q0FBNEM7QUFDNUMsTUFBTUksV0FBV0osbUVBQVlBLENBQzNCSyxRQUFRQyxHQUFHLENBQUNDLFlBQVksRUFDeEJGLFFBQVFDLEdBQUcsQ0FBQ0Usb0JBQW9CO0FBR25CLGVBQWVDLFFBQVFDLEdBQUcsRUFBRUMsR0FBRztJQUM1QyxJQUFJRCxJQUFJRSxNQUFNLEtBQUssUUFBUTtRQUN6QkQsSUFBSUUsU0FBUyxDQUFDLFNBQVM7UUFDdkIsT0FBT0YsSUFBSUcsTUFBTSxDQUFDLEtBQUtDLElBQUksQ0FBQztZQUFFQyxPQUFPO1FBQW9CO0lBQzNEO0lBRUEsTUFBTSxFQUFFQyxlQUFlLEVBQUVDLFFBQVEsRUFBRSxHQUFHUixJQUFJUyxJQUFJO0lBQzlDLElBQUksQ0FBQ0YsbUJBQW1CLENBQUNDLFVBQVU7UUFDakMsT0FBT1AsSUFBSUcsTUFBTSxDQUFDLEtBQUtDLElBQUksQ0FBQztZQUFFQyxPQUFPO1FBQTRCO0lBQ25FO0lBRUEsNERBQTREO0lBQzVELE1BQU0sRUFBRUksSUFBSSxFQUFFSixLQUFLLEVBQUUsR0FBRyxNQUFNWixTQUMzQmlCLElBQUksQ0FBQyxTQUNMQyxNQUFNLENBQUMsa0NBQ1BDLEVBQUUsQ0FBQyxDQUFDLFlBQVksRUFBRU4sZ0JBQWdCLFVBQVUsRUFBRUEsZ0JBQWdCLENBQUMsRUFDL0RPLE1BQU07SUFFVCxJQUFJUixTQUFTLENBQUNJLE1BQU07UUFDbEIsT0FBT1QsSUFBSUcsTUFBTSxDQUFDLEtBQUtDLElBQUksQ0FBQztZQUFFQyxPQUFPO1FBQXdCO0lBQy9EO0lBRUEsb0JBQW9CO0lBQ3BCLE1BQU1TLFFBQVEsTUFBTXhCLHFEQUFjLENBQUNpQixVQUFVRSxLQUFLTyxhQUFhO0lBQy9ELElBQUksQ0FBQ0YsT0FBTztRQUNWLE9BQU9kLElBQUlHLE1BQU0sQ0FBQyxLQUFLQyxJQUFJLENBQUM7WUFBRUMsT0FBTztRQUF3QjtJQUMvRDtJQUVBLGlEQUFpRDtJQUNqRCxJQUFJWSxZQUFZUixLQUFLUyxJQUFJO0lBQ3pCLElBQUk7UUFDRixNQUFNLEVBQUVULE1BQU1VLE1BQU0sRUFBRWQsT0FBT2UsT0FBTyxFQUFFLEdBQUcsTUFBTTNCLFNBQVM0QixJQUFJLENBQUNDLEtBQUssQ0FBQ0MsV0FBVyxDQUFDZCxLQUFLZSxFQUFFO1FBQ3RGLElBQUksQ0FBQ0osV0FBV0QsT0FBT00sSUFBSSxDQUFDQyxrQkFBa0IsRUFBRVIsTUFBTTtZQUNwREQsWUFBWUUsT0FBT00sSUFBSSxDQUFDQyxrQkFBa0IsQ0FBQ1IsSUFBSTtRQUNqRDtJQUNGLEVBQUUsT0FBT1MsR0FBRztRQUNWQyxRQUFRdkIsS0FBSyxDQUFDLG9DQUFvQ3NCO0lBQ3BEO0lBRUEsc0VBQXNFO0lBQ3RFLE1BQU1FLFFBQVF0Qyx3REFBUSxDQUNwQjtRQUNFd0MsUUFBVXRCLEtBQUtlLEVBQUU7UUFDakJRLFVBQVV2QixLQUFLdUIsUUFBUTtRQUN2QmQsTUFBVUQsVUFBYSw0QkFBNEI7SUFDckQsR0FDQXZCLFFBQVFDLEdBQUcsQ0FBQ3NDLFVBQVUsRUFDdEI7UUFBRUMsV0FBVztJQUFLO0lBR3BCbEMsSUFBSUUsU0FBUyxDQUFDLGNBQWNWLGlEQUFTQSxDQUFDLGNBQWNxQyxPQUFPO1FBQ3pETSxVQUFVO1FBQ1ZDLFFBQVExQyxrQkFBeUI7UUFDakMyQyxVQUFVO1FBQ1ZDLE1BQU07UUFDTkMsUUFBUSxLQUFLLEtBQUs7SUFDcEI7SUFFQSxPQUFPdkMsSUFBSUcsTUFBTSxDQUFDLEtBQUtDLElBQUksQ0FBQztRQUFFb0MsU0FBUztRQUFXVCxRQUFRdEIsS0FBS2UsRUFBRTtJQUFDO0FBQ3BFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ29mdXQtZnVuLy4vcGFnZXMvYXBpL2xvZ2luLmpzP2FlODgiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gcGFnZXMvYXBpL2xvZ2luLmpzXHJcblxyXG5pbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnXHJcbmltcG9ydCBiY3J5cHQgZnJvbSAnYmNyeXB0J1xyXG5pbXBvcnQgand0IGZyb20gJ2pzb253ZWJ0b2tlbidcclxuaW1wb3J0IHsgc2VyaWFsaXplIH0gZnJvbSAnY29va2llJ1xyXG5cclxuLy8gSW5pY2lhIGNsaWVudGUgU3VwYWJhc2UgY29tIGEgU2VydmljZSBLZXlcclxuY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoXHJcbiAgcHJvY2Vzcy5lbnYuU1VQQUJBU0VfVVJMLFxyXG4gIHByb2Nlc3MuZW52LlNVUEFCQVNFX1NFUlZJQ0VfS0VZXHJcbilcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIocmVxLCByZXMpIHtcclxuICBpZiAocmVxLm1ldGhvZCAhPT0gJ1BPU1QnKSB7XHJcbiAgICByZXMuc2V0SGVhZGVyKCdBbGxvdycsICdQT1NUJylcclxuICAgIHJldHVybiByZXMuc3RhdHVzKDQwNSkuanNvbih7IGVycm9yOiAnU8OzIFBPU1QgcGVybWl0aWRvJyB9KVxyXG4gIH1cclxuXHJcbiAgY29uc3QgeyB1c2VybmFtZU9yRW1haWwsIHBhc3N3b3JkIH0gPSByZXEuYm9keVxyXG4gIGlmICghdXNlcm5hbWVPckVtYWlsIHx8ICFwYXNzd29yZCkge1xyXG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdQcmVlbmNoYSB0b2RvcyBvcyBjYW1wb3MuJyB9KVxyXG4gIH1cclxuXHJcbiAgLy8gMe+4j+KDoyBCdXNjYSB1c3XDoXJpbyBwb3IgdXNlcm5hbWUgb3UgZW1haWwsIGluY2x1aW5kbyBhIHJvbGVcclxuICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgLmZyb20oJ3VzZXJzJylcclxuICAgIC5zZWxlY3QoJ2lkLHBhc3N3b3JkX2hhc2gsdXNlcm5hbWUscm9sZScpXHJcbiAgICAub3IoYHVzZXJuYW1lLmVxLiR7dXNlcm5hbWVPckVtYWlsfSxlbWFpbC5lcS4ke3VzZXJuYW1lT3JFbWFpbH1gKVxyXG4gICAgLnNpbmdsZSgpXHJcblxyXG4gIGlmIChlcnJvciB8fCAhZGF0YSkge1xyXG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAxKS5qc29uKHsgZXJyb3I6ICdDcmVkZW5jaWFpcyBpbnbDoWxpZGFzJyB9KVxyXG4gIH1cclxuXHJcbiAgLy8gMu+4j+KDoyBDb21wYXJhIHNlbmhhXHJcbiAgY29uc3QgbWF0Y2ggPSBhd2FpdCBiY3J5cHQuY29tcGFyZShwYXNzd29yZCwgZGF0YS5wYXNzd29yZF9oYXNoKVxyXG4gIGlmICghbWF0Y2gpIHtcclxuICAgIHJldHVybiByZXMuc3RhdHVzKDQwMSkuanNvbih7IGVycm9yOiAnQ3JlZGVuY2lhaXMgaW52w6FsaWRhcycgfSlcclxuICB9XHJcblxyXG4gIC8vIDPvuI/ig6MgQnVzY2EgYSByb2xlIG1haXMgYXR1YWxpemFkYSBkbyBhdXRoLnVzZXJzXHJcbiAgbGV0IGZpbmFsUm9sZSA9IGRhdGEucm9sZVxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB7IGRhdGE6IHNiVXNlciwgZXJyb3I6IHNiRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguYWRtaW4uZ2V0VXNlckJ5SWQoZGF0YS5pZClcclxuICAgIGlmICghc2JFcnJvciAmJiBzYlVzZXIudXNlci5yYXdfdXNlcl9tZXRhX2RhdGE/LnJvbGUpIHtcclxuICAgICAgZmluYWxSb2xlID0gc2JVc2VyLnVzZXIucmF3X3VzZXJfbWV0YV9kYXRhLnJvbGVcclxuICAgIH1cclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvIGFvIGJ1c2NhciBtZXRhZGF0YSBkZSByb2xlOicsIGUpXHJcbiAgfVxyXG5cclxuICAvLyA077iP4oOjIFN1Y2Vzc28g4oCUIGdlcmEgSldUIGluY2x1aW5kbyBhIHJvbGUgZSBjb25maWd1cmEgY29va2llIEh0dHBPbmx5XHJcbiAgY29uc3QgdG9rZW4gPSBqd3Quc2lnbihcclxuICAgIHtcclxuICAgICAgdXNlcklkOiAgIGRhdGEuaWQsXHJcbiAgICAgIHVzZXJuYW1lOiBkYXRhLnVzZXJuYW1lLFxyXG4gICAgICByb2xlOiAgICAgZmluYWxSb2xlICAgIC8vIDwtLSB1c2EgYSByb2xlIGF0dWFsaXphZGFcclxuICAgIH0sXHJcbiAgICBwcm9jZXNzLmVudi5KV1RfU0VDUkVULFxyXG4gICAgeyBleHBpcmVzSW46ICcyaCcgfVxyXG4gIClcclxuXHJcbiAgcmVzLnNldEhlYWRlcignU2V0LUNvb2tpZScsIHNlcmlhbGl6ZSgnYXV0aF90b2tlbicsIHRva2VuLCB7XHJcbiAgICBodHRwT25seTogdHJ1ZSxcclxuICAgIHNlY3VyZTogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJyxcclxuICAgIHNhbWVTaXRlOiAnc3RyaWN0JyxcclxuICAgIHBhdGg6ICcvJyxcclxuICAgIG1heEFnZTogNjAgKiA2MCAqIDJcclxuICB9KSlcclxuXHJcbiAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgbWVzc2FnZTogJ0xvZ2FkbyEnLCB1c2VySWQ6IGRhdGEuaWQgfSlcclxufVxyXG4iXSwibmFtZXMiOlsiY3JlYXRlQ2xpZW50IiwiYmNyeXB0Iiwiand0Iiwic2VyaWFsaXplIiwic3VwYWJhc2UiLCJwcm9jZXNzIiwiZW52IiwiU1VQQUJBU0VfVVJMIiwiU1VQQUJBU0VfU0VSVklDRV9LRVkiLCJoYW5kbGVyIiwicmVxIiwicmVzIiwibWV0aG9kIiwic2V0SGVhZGVyIiwic3RhdHVzIiwianNvbiIsImVycm9yIiwidXNlcm5hbWVPckVtYWlsIiwicGFzc3dvcmQiLCJib2R5IiwiZGF0YSIsImZyb20iLCJzZWxlY3QiLCJvciIsInNpbmdsZSIsIm1hdGNoIiwiY29tcGFyZSIsInBhc3N3b3JkX2hhc2giLCJmaW5hbFJvbGUiLCJyb2xlIiwic2JVc2VyIiwic2JFcnJvciIsImF1dGgiLCJhZG1pbiIsImdldFVzZXJCeUlkIiwiaWQiLCJ1c2VyIiwicmF3X3VzZXJfbWV0YV9kYXRhIiwiZSIsImNvbnNvbGUiLCJ0b2tlbiIsInNpZ24iLCJ1c2VySWQiLCJ1c2VybmFtZSIsIkpXVF9TRUNSRVQiLCJleHBpcmVzSW4iLCJodHRwT25seSIsInNlY3VyZSIsInNhbWVTaXRlIiwicGF0aCIsIm1heEFnZSIsIm1lc3NhZ2UiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(api)/./pages/api/login.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(api)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Flogin&preferredRegion=&absolutePagePath=.%2Fpages%5Capi%5Clogin.js&middlewareConfigBase64=e30%3D!")));
module.exports = __webpack_exports__;

})();