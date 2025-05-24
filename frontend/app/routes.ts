import { type RouteConfig, route, layout } from "@react-router/dev/routes";

export default [
    layout('routes/admin/admin-layout.tsx', [
        route('admin/dashboard', 'routes/admin/dashboard.tsx'),
        route('admin/settings', 'routes/admin/settings.tsx'),
        route('/watch/:fileId', 'routes/stream-video.tsx')
    ]),

    
] satisfies RouteConfig;
