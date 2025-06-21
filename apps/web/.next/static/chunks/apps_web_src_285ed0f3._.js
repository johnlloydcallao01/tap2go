(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/apps/web/src/components/RestaurantCard.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>RestaurantCard)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$solid$2f$esm$2f$StarIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__StarIcon$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/@heroicons/react/24/solid/esm/StarIcon.js [app-client] (ecmascript) <export default as StarIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$solid$2f$esm$2f$ClockIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClockIcon$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/@heroicons/react/24/solid/esm/ClockIcon.js [app-client] (ecmascript) <export default as ClockIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$solid$2f$esm$2f$TruckIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TruckIcon$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/@heroicons/react/24/solid/esm/TruckIcon.js [app-client] (ecmascript) <export default as TruckIcon>");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
function RestaurantCard({ restaurant }) {
    _s();
    const [imageError, setImageError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        href: `/restaurant/${restaurant.id}`,
        className: "block",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "card hover:shadow-lg transition-shadow duration-200",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative h-48 w-full",
                    children: [
                        imageError || !restaurant.image ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-full h-full bg-gray-200 flex items-center justify-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-2xl font-bold text-gray-500",
                                            children: restaurant.name ? restaurant.name.charAt(0) : '?'
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                                            lineNumber: 23,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                                        lineNumber: 22,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-500",
                                        children: restaurant.name || 'Restaurant'
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                                        lineNumber: 27,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                                lineNumber: 21,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                            lineNumber: 20,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            src: restaurant.image,
                            alt: restaurant.name || 'Restaurant',
                            fill: true,
                            className: "object-cover",
                            sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
                            onError: ()=>setImageError(true)
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                            lineNumber: 31,
                            columnNumber: 13
                        }, this),
                        restaurant.featured && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute top-2 left-2 text-white px-2 py-1 rounded-md text-xs font-semibold",
                            style: {
                                backgroundColor: '#f3a823'
                            },
                            children: "Featured"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                            lineNumber: 41,
                            columnNumber: 13
                        }, this),
                        !restaurant.isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-white font-semibold text-lg",
                                children: "Closed"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                                lineNumber: 47,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                            lineNumber: 46,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                    lineNumber: 18,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start justify-between mb-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-lg font-semibold text-gray-900 line-clamp-1",
                                    children: restaurant.name
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                                    lineNumber: 55,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center space-x-1 ml-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$solid$2f$esm$2f$StarIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__StarIcon$3e$__["StarIcon"], {
                                            className: "h-4 w-4 text-yellow-400"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                                            lineNumber: 59,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm font-medium text-gray-700",
                                            children: restaurant.rating ? restaurant.rating.toFixed(1) : 'N/A'
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                                            lineNumber: 60,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm text-gray-500",
                                            children: [
                                                "(",
                                                restaurant.reviewCount || 0,
                                                ")"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                                            lineNumber: 63,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                                    lineNumber: 58,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                            lineNumber: 54,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-600 text-sm mb-3 line-clamp-2",
                            children: restaurant.description
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                            lineNumber: 69,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap gap-1 mb-3",
                            children: [
                                restaurant.cuisine.slice(0, 3).map((cuisine, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full",
                                        children: cuisine
                                    }, index, false, {
                                        fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                                        lineNumber: 76,
                                        columnNumber: 15
                                    }, this)),
                                restaurant.cuisine.length > 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full",
                                    children: [
                                        "+",
                                        restaurant.cuisine.length - 3,
                                        " more"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                                    lineNumber: 84,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                            lineNumber: 74,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between text-sm text-gray-600",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center space-x-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center space-x-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$solid$2f$esm$2f$ClockIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClockIcon$3e$__["ClockIcon"], {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                                                    lineNumber: 94,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: restaurant.deliveryTime
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                                                    lineNumber: 95,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                                            lineNumber: 93,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center space-x-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$solid$2f$esm$2f$TruckIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TruckIcon$3e$__["TruckIcon"], {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                                                    lineNumber: 98,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: [
                                                        "$",
                                                        restaurant.deliveryFee ? restaurant.deliveryFee.toFixed(2) : '0.00'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                                                    lineNumber: 99,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                                            lineNumber: 97,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                                    lineNumber: 92,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-right",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs text-gray-500",
                                            children: "Min order"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                                            lineNumber: 103,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "font-medium",
                                            children: [
                                                "$",
                                                restaurant.minimumOrder ? restaurant.minimumOrder.toFixed(2) : '0.00'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                                            lineNumber: 104,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                                    lineNumber: 102,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                            lineNumber: 91,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
                    lineNumber: 53,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
            lineNumber: 16,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/RestaurantCard.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
_s(RestaurantCard, "gLR0P7wgc8ZXiun/rQPANvAzwwQ=");
_c = RestaurantCard;
var _c;
__turbopack_context__.k.register(_c, "RestaurantCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/src/lib/transformers/restaurant.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "transformRestaurantData": (()=>transformRestaurantData),
    "transformRestaurantsData": (()=>transformRestaurantsData)
});
const transformRestaurantData = (doc)=>{
    const data = doc.data();
    return {
        id: doc.id,
        name: data.outletName || data.name || '',
        description: data.description || '',
        image: data.coverImageUrl || data.image || '/api/placeholder/300/200',
        coverImage: data.coverImageUrl || data.image || '',
        cuisine: data.cuisineTags || data.cuisine || [],
        address: data.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        },
        phone: data.outletPhone || data.phone || '',
        email: data.email || '',
        ownerId: data.vendorRef || data.ownerId || '',
        rating: data.avgRating || data.rating || 0,
        reviewCount: data.totalReviews || data.reviewCount || 0,
        deliveryTime: data.estimatedDeliveryRange || data.deliveryTime || 'N/A',
        deliveryFee: data.deliveryFees?.base || data.deliveryFee || 0,
        minimumOrder: data.minOrderValue || data.minimumOrder || 0,
        isOpen: data.isAcceptingOrders !== undefined ? data.isAcceptingOrders : data.isOpen !== undefined ? data.isOpen : true,
        openingHours: data.operatingHours || data.openingHours || {
            monday: {
                open: '09:00',
                close: '22:00',
                isClosed: false
            },
            tuesday: {
                open: '09:00',
                close: '22:00',
                isClosed: false
            },
            wednesday: {
                open: '09:00',
                close: '22:00',
                isClosed: false
            },
            thursday: {
                open: '09:00',
                close: '22:00',
                isClosed: false
            },
            friday: {
                open: '09:00',
                close: '22:00',
                isClosed: false
            },
            saturday: {
                open: '09:00',
                close: '22:00',
                isClosed: false
            },
            sunday: {
                open: '09:00',
                close: '22:00',
                isClosed: false
            }
        },
        featured: data.featured || false,
        status: data.platformStatus || data.status || 'active',
        commissionRate: data.commissionRate || 15,
        totalOrders: data.totalOrders || 0,
        totalRevenue: data.totalRevenue || 0,
        averagePreparationTime: data.preparationTime?.average || data.averagePreparationTime || 20,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date()
    };
};
const transformRestaurantsData = (docs)=>{
    return docs.map(transformRestaurantData);
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/src/lib/googleMapsLoader.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// Professional Google Maps API Loader
// Singleton pattern to prevent multiple API loads
// Industry standard implementation
__turbopack_context__.s({
    "googleMapsLoader": (()=>googleMapsLoader),
    "loadGoogleMaps": (()=>loadGoogleMaps)
});
class GoogleMapsLoader {
    static instance;
    isLoaded = false;
    isLoading = false;
    loadPromise = null;
    callbacks = [];
    errorCallbacks = [];
    constructor(){}
    static getInstance() {
        if (!GoogleMapsLoader.instance) {
            GoogleMapsLoader.instance = new GoogleMapsLoader();
        }
        return GoogleMapsLoader.instance;
    }
    async load(options) {
        // If already loaded, resolve immediately
        if (this.isLoaded && window.google && window.google.maps) {
            return Promise.resolve();
        }
        // If currently loading, return the existing promise
        if (this.isLoading && this.loadPromise) {
            return this.loadPromise;
        }
        // Start loading
        this.isLoading = true;
        this.loadPromise = this.loadGoogleMaps(options);
        return this.loadPromise;
    }
    loadGoogleMaps(options) {
        return new Promise((resolve, reject)=>{
            // Check if already loaded
            if (window.google && window.google.maps) {
                this.isLoaded = true;
                this.isLoading = false;
                this.notifyCallbacks();
                resolve();
                return;
            }
            // Check if script already exists
            const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
            if (existingScript) {
                // Script exists, wait for it to load
                const checkLoaded = ()=>{
                    if (window.google && window.google.maps) {
                        this.isLoaded = true;
                        this.isLoading = false;
                        this.notifyCallbacks();
                        resolve();
                    } else {
                        setTimeout(checkLoaded, 100);
                    }
                };
                checkLoaded();
                return;
            }
            // Create unique callback name
            const callbackName = `googleMapsCallback_${Date.now()}`;
            // Set up global callback
            window[callbackName] = ()=>{
                this.isLoaded = true;
                this.isLoading = false;
                this.notifyCallbacks();
                // Clean up
                delete window[callbackName];
                resolve();
            };
            // Build URL
            const libraries = options.libraries?.join(',') || 'places';
            const language = options.language || 'en';
            const region = options.region || 'PH';
            const url = `https://maps.googleapis.com/maps/api/js?key=${options.apiKey}&libraries=${libraries}&language=${language}&region=${region}&callback=${callbackName}`;
            // Create and load script
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            script.defer = true;
            script.onerror = ()=>{
                this.isLoading = false;
                this.loadPromise = null;
                const error = 'Failed to load Google Maps API';
                this.notifyErrorCallbacks(error);
                reject(new Error(error));
            };
            document.head.appendChild(script);
        });
    }
    onLoad(callback) {
        if (this.isLoaded) {
            callback();
        } else {
            this.callbacks.push(callback);
        }
    }
    onError(callback) {
        this.errorCallbacks.push(callback);
    }
    notifyCallbacks() {
        this.callbacks.forEach((callback)=>callback());
        this.callbacks = [];
    }
    notifyErrorCallbacks(error) {
        this.errorCallbacks.forEach((callback)=>callback(error));
        this.errorCallbacks = [];
    }
    isGoogleMapsLoaded() {
        return this.isLoaded && !!(window.google && window.google.maps);
    }
}
const googleMapsLoader = GoogleMapsLoader.getInstance();
const loadGoogleMaps = async (apiKey)=>{
    return googleMapsLoader.load({
        apiKey,
        libraries: [
            'places'
        ],
        region: 'PH'
    });
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/src/components/ProfessionalMap.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>ProfessionalMap)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$googleMapsLoader$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/googleMapsLoader.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function ProfessionalMap({ center = {
    lat: 14.5995,
    lng: 120.9842
}, zoom = 15, height = '400px', className = '', onLocationSelect }) {
    _s();
    const mapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const mapInstanceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const markerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const infoWindowRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const autocompleteRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const searchInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [isLoaded, setIsLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedLocation, setSelectedLocation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    // Load Google Maps API using singleton loader
    const loadMapsAPI = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProfessionalMap.useCallback[loadMapsAPI]": async ()=>{
            const apiKey = ("TURBOPACK compile-time value", "AIzaSyDWWpv5PBQFpfIkHmtOnHTGktHv5o36Cnw");
            if ("TURBOPACK compile-time falsy", 0) {
                "TURBOPACK unreachable";
            }
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$googleMapsLoader$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadGoogleMaps"])(apiKey);
                setIsLoaded(true);
                setIsLoading(false);
            } catch (err) {
                setError('Failed to load Google Maps');
                setIsLoading(false);
                console.error('Google Maps loading error:', err);
            }
        }
    }["ProfessionalMap.useCallback[loadMapsAPI]"], []);
    // Initialize map
    const initializeMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProfessionalMap.useCallback[initializeMap]": ()=>{
            if (!mapRef.current || !window.google || mapInstanceRef.current) return;
            try {
                // Create map with professional settings
                mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
                    center,
                    zoom,
                    mapTypeId: 'roadmap',
                    disableDefaultUI: false,
                    zoomControl: true,
                    mapTypeControl: false,
                    scaleControl: true,
                    streetViewControl: false,
                    rotateControl: false,
                    fullscreenControl: true,
                    gestureHandling: 'auto',
                    styles: [
                        {
                            featureType: 'poi',
                            elementType: 'labels',
                            stylers: [
                                {
                                    visibility: 'off'
                                }
                            ]
                        }
                    ]
                });
                // Add click listener for location selection
                mapInstanceRef.current.addListener('click', {
                    "ProfessionalMap.useCallback[initializeMap]": (event)=>{
                        // Close any open info windows when clicking on empty map area
                        if (infoWindowRef.current) {
                            infoWindowRef.current.close();
                        }
                        const lat = event.latLng?.lat() ?? 0;
                        const lng = event.latLng?.lng() ?? 0;
                        // Remove existing marker and info window
                        if (markerRef.current) {
                            markerRef.current.setMap(null);
                        }
                        if (infoWindowRef.current) {
                            infoWindowRef.current.close();
                        }
                        // Reverse geocode to get address first
                        const geocoder = new window.google.maps.Geocoder();
                        geocoder.geocode({
                            location: {
                                lat,
                                lng
                            }
                        }, {
                            "ProfessionalMap.useCallback[initializeMap]": (results, status)=>{
                                if (status === 'OK' && results && results[0]) {
                                    const address = results[0].formatted_address;
                                    const placeName = results[0].address_components?.[0]?.long_name || 'Selected Location';
                                    // Add new marker with Google Maps style - DRAGGABLE
                                    markerRef.current = new window.google.maps.Marker({
                                        position: {
                                            lat,
                                            lng
                                        },
                                        map: mapInstanceRef.current,
                                        title: address,
                                        draggable: true,
                                        icon: {
                                            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                                            fillColor: '#EA4335',
                                            fillOpacity: 1,
                                            strokeColor: '#ffffff',
                                            strokeWeight: 2,
                                            scale: 1.5,
                                            anchor: new window.google.maps.Point(12, 24)
                                        }
                                    });
                                    // Create info window with Google Maps style content
                                    infoWindowRef.current = new window.google.maps.InfoWindow({
                                        content: `
                <div style="padding: 12px; min-width: 200px; font-family: Roboto, Arial, sans-serif;">
                  <div style="font-weight: 500; font-size: 16px; color: #202124; margin-bottom: 4px;">
                    ${placeName}
                  </div>
                  <div style="font-size: 14px; color: #5f6368; line-height: 1.4; margin-bottom: 8px;">
                    ${address}
                  </div>
                  <div style="font-size: 12px; color: #70757a; display: flex; justify-content: space-between;">
                    <span>Lat: ${lat.toFixed(6)}</span>
                    <span>Lng: ${lng.toFixed(6)}</span>
                  </div>
                </div>
              `,
                                        pixelOffset: new window.google.maps.Size(0, -10)
                                    });
                                    // Open info window immediately
                                    if (infoWindowRef.current && mapInstanceRef.current && markerRef.current) {
                                        infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
                                    }
                                    // Add click listener to marker to reopen info window
                                    markerRef.current.addListener('click', {
                                        "ProfessionalMap.useCallback[initializeMap]": ()=>{
                                            if (infoWindowRef.current && mapInstanceRef.current && markerRef.current) {
                                                infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
                                            }
                                        }
                                    }["ProfessionalMap.useCallback[initializeMap]"]);
                                    // Add drag listener to update location when marker is dragged
                                    markerRef.current.addListener('dragend', {
                                        "ProfessionalMap.useCallback[initializeMap]": (event)=>{
                                            const newLat = event.latLng?.lat() ?? 0;
                                            const newLng = event.latLng?.lng() ?? 0;
                                            // Update info window content with new coordinates
                                            const geocoder = new window.google.maps.Geocoder();
                                            geocoder.geocode({
                                                location: {
                                                    lat: newLat,
                                                    lng: newLng
                                                }
                                            }, {
                                                "ProfessionalMap.useCallback[initializeMap]": (results, status)=>{
                                                    if (status === 'OK' && results && results[0]) {
                                                        const newAddress = results[0].formatted_address;
                                                        const newPlaceName = results[0].address_components?.[0]?.long_name || 'Dragged Location';
                                                        // Update info window content
                                                        if (infoWindowRef.current) {
                                                            infoWindowRef.current.setContent(`
                    <div style="padding: 12px; min-width: 200px; font-family: Roboto, Arial, sans-serif;">
                      <div style="font-weight: 500; font-size: 16px; color: #202124; margin-bottom: 4px;">
                        ${newPlaceName}
                      </div>
                      <div style="font-size: 13px; color: #1a73e8; margin-bottom: 8px; font-weight: 500;">
                        📍 Dragged Location
                      </div>
                      <div style="font-size: 14px; color: #5f6368; line-height: 1.4; margin-bottom: 8px;">
                        ${newAddress}
                      </div>
                      <div style="font-size: 12px; color: #70757a; display: flex; justify-content: space-between;">
                        <span>Lat: ${newLat.toFixed(6)}</span>
                        <span>Lng: ${newLng.toFixed(6)}</span>
                      </div>
                    </div>
                  `);
                                                        }
                                                        // Update marker title
                                                        if (markerRef.current) {
                                                            markerRef.current.setTitle(newAddress);
                                                        }
                                                        // Update state
                                                        setSelectedLocation(newAddress);
                                                        onLocationSelect?.({
                                                            lat: newLat,
                                                            lng: newLng,
                                                            address: newAddress
                                                        });
                                                    } else {
                                                        // Fallback if geocoding fails
                                                        const fallbackAddress = `Dragged to ${newLat.toFixed(6)}, ${newLng.toFixed(6)}`;
                                                        if (infoWindowRef.current) {
                                                            infoWindowRef.current.setContent(`
                    <div style="padding: 12px; min-width: 200px; font-family: Roboto, Arial, sans-serif;">
                      <div style="font-weight: 500; font-size: 16px; color: #202124; margin-bottom: 4px;">
                        Dragged Location
                      </div>
                      <div style="font-size: 13px; color: #1a73e8; margin-bottom: 8px; font-weight: 500;">
                        📍 Custom Position
                      </div>
                      <div style="font-size: 12px; color: #70757a; display: flex; justify-content: space-between;">
                        <span>Lat: ${newLat.toFixed(6)}</span>
                        <span>Lng: ${newLng.toFixed(6)}</span>
                      </div>
                    </div>
                  `);
                                                        }
                                                        if (markerRef.current) {
                                                            markerRef.current.setTitle(fallbackAddress);
                                                        }
                                                        setSelectedLocation(fallbackAddress);
                                                        onLocationSelect?.({
                                                            lat: newLat,
                                                            lng: newLng,
                                                            address: fallbackAddress
                                                        });
                                                    }
                                                }
                                            }["ProfessionalMap.useCallback[initializeMap]"]);
                                        }
                                    }["ProfessionalMap.useCallback[initializeMap]"]);
                                    setSelectedLocation(address);
                                    onLocationSelect?.({
                                        lat,
                                        lng,
                                        address
                                    });
                                } else {
                                    // Fallback if geocoding fails
                                    const fallbackAddress = `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                                    markerRef.current = new window.google.maps.Marker({
                                        position: {
                                            lat,
                                            lng
                                        },
                                        map: mapInstanceRef.current,
                                        title: fallbackAddress,
                                        draggable: true,
                                        icon: {
                                            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                                            fillColor: '#EA4335',
                                            fillOpacity: 1,
                                            strokeColor: '#ffffff',
                                            strokeWeight: 2,
                                            scale: 1.5,
                                            anchor: new window.google.maps.Point(12, 24)
                                        }
                                    });
                                    infoWindowRef.current = new window.google.maps.InfoWindow({
                                        content: `
                <div style="padding: 12px; min-width: 200px; font-family: Roboto, Arial, sans-serif;">
                  <div style="font-weight: 500; font-size: 16px; color: #202124; margin-bottom: 4px;">
                    Selected Location
                  </div>
                  <div style="font-size: 12px; color: #70757a; display: flex; justify-content: space-between;">
                    <span>Lat: ${lat.toFixed(6)}</span>
                    <span>Lng: ${lng.toFixed(6)}</span>
                  </div>
                </div>
              `,
                                        pixelOffset: new window.google.maps.Size(0, -10)
                                    });
                                    if (infoWindowRef.current && mapInstanceRef.current && markerRef.current) {
                                        infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
                                    }
                                    markerRef.current.addListener('click', {
                                        "ProfessionalMap.useCallback[initializeMap]": ()=>{
                                            if (infoWindowRef.current && mapInstanceRef.current && markerRef.current) {
                                                infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
                                            }
                                        }
                                    }["ProfessionalMap.useCallback[initializeMap]"]);
                                    // Add drag listener for fallback marker
                                    markerRef.current.addListener('dragend', {
                                        "ProfessionalMap.useCallback[initializeMap]": (event)=>{
                                            const newLat = event.latLng?.lat() ?? 0;
                                            const newLng = event.latLng?.lng() ?? 0;
                                            // Try to get address for new position
                                            const geocoder = new window.google.maps.Geocoder();
                                            geocoder.geocode({
                                                location: {
                                                    lat: newLat,
                                                    lng: newLng
                                                }
                                            }, {
                                                "ProfessionalMap.useCallback[initializeMap]": (results, status)=>{
                                                    if (status === 'OK' && results && results[0]) {
                                                        const newAddress = results[0].formatted_address;
                                                        const newPlaceName = results[0].address_components?.[0]?.long_name || 'Dragged Location';
                                                        if (infoWindowRef.current) {
                                                            infoWindowRef.current.setContent(`
                    <div style="padding: 12px; min-width: 200px; font-family: Roboto, Arial, sans-serif;">
                      <div style="font-weight: 500; font-size: 16px; color: #202124; margin-bottom: 4px;">
                        ${newPlaceName}
                      </div>
                      <div style="font-size: 13px; color: #1a73e8; margin-bottom: 8px; font-weight: 500;">
                        📍 Dragged Location
                      </div>
                      <div style="font-size: 14px; color: #5f6368; line-height: 1.4; margin-bottom: 8px;">
                        ${newAddress}
                      </div>
                      <div style="font-size: 12px; color: #70757a; display: flex; justify-content: space-between;">
                        <span>Lat: ${newLat.toFixed(6)}</span>
                        <span>Lng: ${newLng.toFixed(6)}</span>
                      </div>
                    </div>
                  `);
                                                        }
                                                        if (markerRef.current) {
                                                            markerRef.current.setTitle(newAddress);
                                                        }
                                                        setSelectedLocation(newAddress);
                                                        onLocationSelect?.({
                                                            lat: newLat,
                                                            lng: newLng,
                                                            address: newAddress
                                                        });
                                                    } else {
                                                        const newFallbackAddress = `Dragged to ${newLat.toFixed(6)}, ${newLng.toFixed(6)}`;
                                                        if (infoWindowRef.current) {
                                                            infoWindowRef.current.setContent(`
                    <div style="padding: 12px; min-width: 200px; font-family: Roboto, Arial, sans-serif;">
                      <div style="font-weight: 500; font-size: 16px; color: #202124; margin-bottom: 4px;">
                        Dragged Location
                      </div>
                      <div style="font-size: 13px; color: #1a73e8; margin-bottom: 8px; font-weight: 500;">
                        📍 Custom Position
                      </div>
                      <div style="font-size: 12px; color: #70757a; display: flex; justify-content: space-between;">
                        <span>Lat: ${newLat.toFixed(6)}</span>
                        <span>Lng: ${newLng.toFixed(6)}</span>
                      </div>
                    </div>
                  `);
                                                        }
                                                        if (markerRef.current) {
                                                            markerRef.current.setTitle(newFallbackAddress);
                                                        }
                                                        setSelectedLocation(newFallbackAddress);
                                                        onLocationSelect?.({
                                                            lat: newLat,
                                                            lng: newLng,
                                                            address: newFallbackAddress
                                                        });
                                                    }
                                                }
                                            }["ProfessionalMap.useCallback[initializeMap]"]);
                                        }
                                    }["ProfessionalMap.useCallback[initializeMap]"]);
                                    setSelectedLocation(fallbackAddress);
                                    onLocationSelect?.({
                                        lat,
                                        lng,
                                        address: fallbackAddress
                                    });
                                }
                            }
                        }["ProfessionalMap.useCallback[initializeMap]"]);
                    }
                }["ProfessionalMap.useCallback[initializeMap]"]);
            } catch (err) {
                setError('Failed to initialize map');
                console.error('Map initialization error:', err);
            }
        }
    }["ProfessionalMap.useCallback[initializeMap]"], [
        center,
        zoom,
        onLocationSelect
    ]);
    // Initialize autocomplete
    const initializeAutocomplete = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProfessionalMap.useCallback[initializeAutocomplete]": ()=>{
            if (!searchInputRef.current || !window.google || autocompleteRef.current) return;
            try {
                autocompleteRef.current = new window.google.maps.places.Autocomplete(searchInputRef.current, {
                    componentRestrictions: {
                        country: 'PH'
                    },
                    fields: [
                        'place_id',
                        'geometry',
                        'name',
                        'formatted_address'
                    ]
                });
                autocompleteRef.current.addListener('place_changed', {
                    "ProfessionalMap.useCallback[initializeAutocomplete]": ()=>{
                        if (!autocompleteRef.current) return;
                        const place = autocompleteRef.current.getPlace();
                        if (!place.geometry || !place.geometry.location) {
                            return;
                        }
                        const lat = place.geometry.location.lat();
                        const lng = place.geometry.location.lng();
                        const address = place.formatted_address || place.name;
                        const placeName = place.name || 'Selected Location';
                        const placeTypes = place.types || [];
                        // Update map center with smooth animation
                        mapInstanceRef.current?.panTo({
                            lat,
                            lng
                        });
                        mapInstanceRef.current?.setZoom(17);
                        // Remove existing marker and info window
                        if (markerRef.current) {
                            markerRef.current.setMap(null);
                        }
                        if (infoWindowRef.current) {
                            infoWindowRef.current.close();
                        }
                        // Add new marker with Google Maps style pin - DRAGGABLE
                        markerRef.current = new window.google.maps.Marker({
                            position: {
                                lat,
                                lng
                            },
                            map: mapInstanceRef.current,
                            title: address,
                            draggable: true,
                            icon: {
                                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                                fillColor: '#EA4335',
                                fillOpacity: 1,
                                strokeColor: '#ffffff',
                                strokeWeight: 2,
                                scale: 1.5,
                                anchor: new window.google.maps.Point(12, 24)
                            }
                        });
                        // Determine place type for display
                        let placeTypeDisplay = '';
                        if (placeTypes.includes('restaurant')) placeTypeDisplay = '🍽️ Restaurant';
                        else if (placeTypes.includes('shopping_mall')) placeTypeDisplay = '🏬 Shopping Mall';
                        else if (placeTypes.includes('hospital')) placeTypeDisplay = '🏥 Hospital';
                        else if (placeTypes.includes('school')) placeTypeDisplay = '🏫 School';
                        else if (placeTypes.includes('bank')) placeTypeDisplay = '🏦 Bank';
                        else if (placeTypes.includes('gas_station')) placeTypeDisplay = '⛽ Gas Station';
                        else if (placeTypes.includes('establishment')) placeTypeDisplay = '📍 Establishment';
                        else placeTypeDisplay = '📍 Location';
                        // Create professional info window with Google Maps styling
                        infoWindowRef.current = new window.google.maps.InfoWindow({
                            content: `
            <div style="padding: 16px; min-width: 250px; max-width: 300px; font-family: Roboto, Arial, sans-serif;">
              <div style="font-weight: 500; font-size: 18px; color: #202124; margin-bottom: 6px; line-height: 1.3;">
                ${placeName}
              </div>
              ${placeTypeDisplay ? `
                <div style="font-size: 13px; color: #1a73e8; margin-bottom: 8px; font-weight: 500;">
                  ${placeTypeDisplay}
                </div>
              ` : ''}
              <div style="font-size: 14px; color: #5f6368; line-height: 1.4; margin-bottom: 12px;">
                ${address}
              </div>
              <div style="border-top: 1px solid #e8eaed; padding-top: 8px;">
                <div style="font-size: 12px; color: #70757a; display: flex; justify-content: space-between;">
                  <span>Lat: ${lat.toFixed(6)}</span>
                  <span>Lng: ${lng.toFixed(6)}</span>
                </div>
              </div>
            </div>
          `,
                            pixelOffset: new window.google.maps.Size(0, -10)
                        });
                        // Open info window immediately
                        if (infoWindowRef.current && mapInstanceRef.current && markerRef.current) {
                            infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
                        }
                        // Add click listener to marker to reopen info window
                        markerRef.current.addListener('click', {
                            "ProfessionalMap.useCallback[initializeAutocomplete]": ()=>{
                                if (infoWindowRef.current && mapInstanceRef.current && markerRef.current) {
                                    infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
                                }
                            }
                        }["ProfessionalMap.useCallback[initializeAutocomplete]"]);
                        // Add drag listener for search result marker
                        markerRef.current.addListener('dragend', {
                            "ProfessionalMap.useCallback[initializeAutocomplete]": (event)=>{
                                const newLat = event.latLng?.lat() ?? 0;
                                const newLng = event.latLng?.lng() ?? 0;
                                // Get new address for dragged position
                                const geocoder = new window.google.maps.Geocoder();
                                geocoder.geocode({
                                    location: {
                                        lat: newLat,
                                        lng: newLng
                                    }
                                }, {
                                    "ProfessionalMap.useCallback[initializeAutocomplete]": (results, status)=>{
                                        if (status === 'OK' && results && results[0]) {
                                            const newAddress = results[0].formatted_address;
                                            const newPlaceName = results[0].address_components?.[0]?.long_name || 'Dragged Location';
                                            const newPlaceTypes = results[0].types || [];
                                            // Determine new place type
                                            let newPlaceTypeDisplay = '';
                                            if (newPlaceTypes.includes('restaurant')) newPlaceTypeDisplay = '🍽️ Restaurant';
                                            else if (newPlaceTypes.includes('shopping_mall')) newPlaceTypeDisplay = '🏬 Shopping Mall';
                                            else if (newPlaceTypes.includes('hospital')) newPlaceTypeDisplay = '🏥 Hospital';
                                            else if (newPlaceTypes.includes('school')) newPlaceTypeDisplay = '🏫 School';
                                            else if (newPlaceTypes.includes('bank')) newPlaceTypeDisplay = '🏦 Bank';
                                            else if (newPlaceTypes.includes('gas_station')) newPlaceTypeDisplay = '⛽ Gas Station';
                                            else if (newPlaceTypes.includes('establishment')) newPlaceTypeDisplay = '📍 Establishment';
                                            else newPlaceTypeDisplay = '📍 Dragged Location';
                                            // Update info window content
                                            if (infoWindowRef.current) {
                                                infoWindowRef.current.setContent(`
                <div style="padding: 16px; min-width: 250px; max-width: 300px; font-family: Roboto, Arial, sans-serif;">
                  <div style="font-weight: 500; font-size: 18px; color: #202124; margin-bottom: 6px; line-height: 1.3;">
                    ${newPlaceName}
                  </div>
                  <div style="font-size: 13px; color: #1a73e8; margin-bottom: 8px; font-weight: 500;">
                    ${newPlaceTypeDisplay}
                  </div>
                  <div style="font-size: 14px; color: #5f6368; line-height: 1.4; margin-bottom: 12px;">
                    ${newAddress}
                  </div>
                  <div style="border-top: 1px solid #e8eaed; padding-top: 8px;">
                    <div style="font-size: 12px; color: #70757a; display: flex; justify-content: space-between;">
                      <span>Lat: ${newLat.toFixed(6)}</span>
                      <span>Lng: ${newLng.toFixed(6)}</span>
                    </div>
                  </div>
                </div>
              `);
                                            }
                                            if (markerRef.current) {
                                                markerRef.current.setTitle(newAddress);
                                            }
                                            setSelectedLocation(newAddress);
                                            onLocationSelect?.({
                                                lat: newLat,
                                                lng: newLng,
                                                address: newAddress
                                            });
                                        } else {
                                            // Fallback if geocoding fails
                                            const fallbackAddress = `Dragged to ${newLat.toFixed(6)}, ${newLng.toFixed(6)}`;
                                            if (infoWindowRef.current) {
                                                infoWindowRef.current.setContent(`
                <div style="padding: 16px; min-width: 250px; max-width: 300px; font-family: Roboto, Arial, sans-serif;">
                  <div style="font-weight: 500; font-size: 18px; color: #202124; margin-bottom: 6px; line-height: 1.3;">
                    Dragged Location
                  </div>
                  <div style="font-size: 13px; color: #1a73e8; margin-bottom: 8px; font-weight: 500;">
                    📍 Custom Position
                  </div>
                  <div style="border-top: 1px solid #e8eaed; padding-top: 8px;">
                    <div style="font-size: 12px; color: #70757a; display: flex; justify-content: space-between;">
                      <span>Lat: ${newLat.toFixed(6)}</span>
                      <span>Lng: ${newLng.toFixed(6)}</span>
                    </div>
                  </div>
                </div>
              `);
                                            }
                                            if (markerRef.current) {
                                                markerRef.current.setTitle(fallbackAddress);
                                            }
                                            setSelectedLocation(fallbackAddress);
                                            onLocationSelect?.({
                                                lat: newLat,
                                                lng: newLng,
                                                address: fallbackAddress
                                            });
                                        }
                                    }
                                }["ProfessionalMap.useCallback[initializeAutocomplete]"]);
                            }
                        }["ProfessionalMap.useCallback[initializeAutocomplete]"]);
                        setSelectedLocation(address || 'Selected Location');
                        onLocationSelect?.({
                            lat,
                            lng,
                            address: address || 'Selected Location'
                        });
                    }
                }["ProfessionalMap.useCallback[initializeAutocomplete]"]);
            } catch (err) {
                console.error('Autocomplete initialization error:', err);
            }
        }
    }["ProfessionalMap.useCallback[initializeAutocomplete]"], [
        onLocationSelect
    ]);
    // Load Google Maps on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProfessionalMap.useEffect": ()=>{
            loadMapsAPI();
        }
    }["ProfessionalMap.useEffect"], [
        loadMapsAPI
    ]);
    // Initialize map when loaded
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProfessionalMap.useEffect": ()=>{
            if (isLoaded) {
                initializeMap();
                initializeAutocomplete();
            }
        }
    }["ProfessionalMap.useEffect"], [
        isLoaded,
        initializeMap,
        initializeAutocomplete
    ]);
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `bg-gray-100 rounded-lg flex items-center justify-center ${className}`,
            style: {
                height
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ProfessionalMap.tsx",
                        lineNumber: 570,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-gray-600",
                        children: "Loading Map..."
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ProfessionalMap.tsx",
                        lineNumber: 571,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/ProfessionalMap.tsx",
                lineNumber: 569,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/apps/web/src/components/ProfessionalMap.tsx",
            lineNumber: 568,
            columnNumber: 7
        }, this);
    }
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `bg-gray-100 rounded-lg flex items-center justify-center ${className}`,
            style: {
                height
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center text-gray-600",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-medium",
                        children: "Map Error"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ProfessionalMap.tsx",
                        lineNumber: 581,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ProfessionalMap.tsx",
                        lineNumber: 582,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/ProfessionalMap.tsx",
                lineNumber: 580,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/apps/web/src/components/ProfessionalMap.tsx",
            lineNumber: 579,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `relative ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-4 left-4 right-4 z-10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    ref: searchInputRef,
                    type: "text",
                    placeholder: "Search any location in Philippines...",
                    className: "w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/ProfessionalMap.tsx",
                    lineNumber: 592,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ProfessionalMap.tsx",
                lineNumber: 591,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: mapRef,
                className: "w-full rounded-lg",
                style: {
                    height
                }
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ProfessionalMap.tsx",
                lineNumber: 601,
                columnNumber: 7
            }, this),
            selectedLocation && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-4 left-4 right-4 bg-white p-3 rounded-lg shadow-lg border",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-medium text-gray-900",
                        children: "Selected Location:"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ProfessionalMap.tsx",
                        lineNumber: 606,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-gray-600 mt-1",
                        children: selectedLocation
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/ProfessionalMap.tsx",
                        lineNumber: 607,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/ProfessionalMap.tsx",
                lineNumber: 605,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/ProfessionalMap.tsx",
        lineNumber: 589,
        columnNumber: 5
    }, this);
}
_s(ProfessionalMap, "MJBak6+wOlo0Z6pKP5N9bmYboxY=");
_c = ProfessionalMap;
var _c;
__turbopack_context__.k.register(_c, "ProfessionalMap");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/apps/web/src/components/home/HomeContent.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>HomeContent)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$RestaurantCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/RestaurantCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.esm2017.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/firebase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$transformers$2f$restaurant$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/transformers/restaurant.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ProfessionalMap$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ProfessionalMap.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
function HomeContent() {
    _s();
    const [restaurants, setRestaurants] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [categories, setCategories] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [selectedCategory, setSelectedCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    // Professional map state
    const [showMap, setShowMap] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedLocation, setSelectedLocation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomeContent.useEffect": ()=>{
            const loadData = {
                "HomeContent.useEffect.loadData": async ()=>{
                    try {
                        // Load categories from Firestore
                        const categoriesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'categories');
                        const categoriesQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(categoriesRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('sortOrder'));
                        const categoriesSnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(categoriesQuery);
                        const categoriesData = categoriesSnapshot.docs.map({
                            "HomeContent.useEffect.loadData.categoriesData": (doc)=>({
                                    id: doc.id,
                                    ...doc.data()
                                })
                        }["HomeContent.useEffect.loadData.categoriesData"]);
                        setCategories(categoriesData);
                        // Load restaurants from Firestore
                        const restaurantsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'restaurants');
                        const restaurantsQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(restaurantsRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(12));
                        const restaurantsSnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(restaurantsQuery);
                        // Use centralized transformer for consistency
                        const restaurantsData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$transformers$2f$restaurant$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["transformRestaurantsData"])(restaurantsSnapshot.docs);
                        setRestaurants(restaurantsData);
                    } catch (error) {
                        console.error('Error loading data:', error);
                        // Set empty arrays if Firestore fails
                        setRestaurants([]);
                        setCategories([]);
                    } finally{
                        setLoading(false);
                    }
                }
            }["HomeContent.useEffect.loadData"];
            loadData();
        }
    }["HomeContent.useEffect"], []);
    const filteredRestaurants = restaurants.filter((restaurant)=>{
        const matchesSearch = !searchQuery || restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) || restaurant.description.toLowerCase().includes(searchQuery.toLowerCase()) || restaurant.cuisine.some((c)=>c.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = !selectedCategory || restaurant.cuisine.includes(selectedCategory);
        return matchesSearch && matchesCategory;
    });
    // Professional map handlers
    const handleLocationSelect = (location)=>{
        setSelectedLocation(location);
        console.log('Location selected:', location);
    };
    const toggleMapView = ()=>{
        setShowMap(!showMap);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "py-8 bg-white border border-gray-200 rounded-lg",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between mb-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-2xl font-bold text-gray-900",
                                            children: "Explore Locations"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                            lineNumber: 89,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-gray-600 mt-1",
                                            children: selectedLocation ? `Selected: ${selectedLocation.address}` : 'Search and explore any location in the Philippines'
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                            lineNumber: 90,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                    lineNumber: 88,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: toggleMapView,
                                    className: `px-4 py-2 rounded-lg font-medium transition-colors ${showMap ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`,
                                    children: showMap ? 'Hide Map' : 'Show Map'
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                    lineNumber: 97,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                            lineNumber: 87,
                            columnNumber: 11
                        }, this),
                        showMap && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gray-50 rounded-lg p-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ProfessionalMap$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    height: "500px",
                                    className: "w-full",
                                    onLocationSelect: handleLocationSelect,
                                    center: selectedLocation ? {
                                        lat: selectedLocation.lat,
                                        lng: selectedLocation.lng
                                    } : undefined
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                    lineNumber: 111,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-4 text-sm text-gray-600 text-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "Search any location • Click on the map to select • Drag markers to adjust position • Professional Google Maps integration"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                        lineNumber: 119,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                    lineNumber: 118,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                            lineNumber: 110,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                    lineNumber: 86,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                lineNumber: 85,
                columnNumber: 7
            }, this),
            categories.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "py-8 bg-white border border-gray-200 rounded-lg",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl font-bold text-gray-900 mb-8",
                            children: "Browse by Category"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                            lineNumber: 130,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap gap-4 mb-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setSelectedCategory(''),
                                    className: `px-4 py-2 rounded-full font-medium transition-colors ${selectedCategory === '' ? 'text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`,
                                    style: selectedCategory === '' ? {
                                        backgroundColor: '#f3a823'
                                    } : {},
                                    children: "All"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                    lineNumber: 132,
                                    columnNumber: 15
                                }, this),
                                categories.map((category)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setSelectedCategory(category.name),
                                        className: `px-4 py-2 rounded-full font-medium transition-colors ${selectedCategory === category.name ? 'text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`,
                                        style: selectedCategory === category.name ? {
                                            backgroundColor: '#f3a823'
                                        } : {},
                                        children: category.name
                                    }, category.id, false, {
                                        fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                        lineNumber: 144,
                                        columnNumber: 17
                                    }, this))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                            lineNumber: 131,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                    lineNumber: 129,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                lineNumber: 128,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "py-8 bg-white border border-gray-200 rounded-lg",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl font-bold text-gray-900 mb-8",
                            children: searchQuery || selectedCategory ? 'Search Results' : 'Restaurants'
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                            lineNumber: 165,
                            columnNumber: 11
                        }, this),
                        loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
                            children: [
                                ...Array(8)
                            ].map((_, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "card animate-pulse",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-48 bg-gray-300"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                            lineNumber: 173,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-4 space-y-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-4 bg-gray-300 rounded w-3/4"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                    lineNumber: 175,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-3 bg-gray-300 rounded w-full"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                    lineNumber: 176,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-3 bg-gray-300 rounded w-2/3"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                    lineNumber: 177,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                            lineNumber: 174,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, index, true, {
                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                    lineNumber: 172,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                            lineNumber: 170,
                            columnNumber: 13
                        }, this) : filteredRestaurants.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
                            children: filteredRestaurants.map((restaurant)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$RestaurantCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    restaurant: restaurant
                                }, restaurant.id, false, {
                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                    lineNumber: 185,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                            lineNumber: 183,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center py-16",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-12 h-12 text-gray-400",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                            lineNumber: 192,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                        lineNumber: 191,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                    lineNumber: 190,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-xl font-semibold text-gray-900 mb-2",
                                    children: "No restaurants available yet"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                    lineNumber: 195,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-500 mb-6",
                                    children: searchQuery || selectedCategory ? 'No restaurants found matching your criteria. Try adjusting your search or filters.' : 'We\'re working on adding amazing restaurants to your area. Check back soon!'
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                    lineNumber: 196,
                                    columnNumber: 15
                                }, this),
                                (searchQuery || selectedCategory) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>{
                                        setSearchQuery('');
                                        setSelectedCategory('');
                                    },
                                    className: "btn-primary",
                                    children: "Clear Filters"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                    lineNumber: 203,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                            lineNumber: 189,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                    lineNumber: 164,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                lineNumber: 163,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "bg-gray-900 text-white py-12 rounded-lg",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 md:grid-cols-4 gap-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center space-x-2 mb-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-8 h-8 rounded-lg flex items-center justify-center",
                                                    style: {
                                                        backgroundColor: '#f3a823'
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-white font-bold text-lg",
                                                        children: "T"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                        lineNumber: 225,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                    lineNumber: 224,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xl font-bold",
                                                    children: "Tap2Go"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                    lineNumber: 227,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                            lineNumber: 223,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-gray-400",
                                            children: "Your favorite food delivery platform. Fast, reliable, and delicious."
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                            lineNumber: 229,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                    lineNumber: 222,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold mb-4",
                                            children: "Company"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                            lineNumber: 234,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                            className: "space-y-2 text-gray-400",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: "#",
                                                        className: "hover:text-white transition-colors",
                                                        children: "About Us"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                        lineNumber: 236,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                    lineNumber: 236,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: "#",
                                                        className: "hover:text-white transition-colors",
                                                        children: "Careers"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                        lineNumber: 237,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                    lineNumber: 237,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: "#",
                                                        className: "hover:text-white transition-colors",
                                                        children: "Press"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                        lineNumber: 238,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                    lineNumber: 238,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                            lineNumber: 235,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                    lineNumber: 233,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold mb-4",
                                            children: "Support"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                            lineNumber: 242,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                            className: "space-y-2 text-gray-400",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: "#",
                                                        className: "hover:text-white transition-colors",
                                                        children: "Help Center"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                        lineNumber: 244,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                    lineNumber: 244,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: "#",
                                                        className: "hover:text-white transition-colors",
                                                        children: "Contact Us"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                        lineNumber: 245,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                    lineNumber: 245,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: "#",
                                                        className: "hover:text-white transition-colors",
                                                        children: "Terms of Service"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                        lineNumber: 246,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                    lineNumber: 246,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                            lineNumber: 243,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                    lineNumber: 241,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold mb-4",
                                            children: "For Restaurants"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                            lineNumber: 250,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                            className: "space-y-2 text-gray-400",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: "#",
                                                        className: "hover:text-white transition-colors",
                                                        children: "Partner with Us"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                        lineNumber: 252,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                    lineNumber: 252,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: "#",
                                                        className: "hover:text-white transition-colors",
                                                        children: "Restaurant Dashboard"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                        lineNumber: 253,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                    lineNumber: 253,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: "#",
                                                        className: "hover:text-white transition-colors",
                                                        children: "Business Support"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                        lineNumber: 254,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                    lineNumber: 254,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: "/analytics-demo",
                                                        className: "hover:text-orange-400 transition-colors font-medium",
                                                        children: "📊 Analytics Demo"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                        lineNumber: 255,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                                    lineNumber: 255,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                            lineNumber: 251,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                    lineNumber: 249,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                            lineNumber: 221,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "border-t border-gray-800 mt-8 pt-8 text-center text-gray-400",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "© 2024 Tap2Go. All rights reserved."
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                                lineNumber: 260,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                            lineNumber: 259,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                    lineNumber: 220,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
                lineNumber: 219,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/home/HomeContent.tsx",
        lineNumber: 83,
        columnNumber: 5
    }, this);
}
_s(HomeContent, "Rh/JyvflnW9Vn9BhHUKJ1J4Uins=");
_c = HomeContent;
var _c;
__turbopack_context__.k.register(_c, "HomeContent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=apps_web_src_285ed0f3._.js.map