import { NextResponse } from 'next/server';

/**
 * /api/seed
 * 
 * Master seed overview and orchestrator endpoint.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const runAll = searchParams.get('all') === 'true';

  if (runAll) {
    try {
      const baseUrl = new URL(request.url).origin;
      const results = {};

      // 1. Seed Tables
      const tablesRes = await fetch(`${baseUrl}/api/seed/tables`).then((r) => r.json());
      results.tables = tablesRes;

      if (!tablesRes.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed at step 1: tables migration',
            details: tablesRes,
          },
          { status: 500 }
        );
      }

      // 2. Seed Developer
      const devRes = await fetch(`${baseUrl}/api/seed/developer`).then((r) => r.json());
      results.developer = devRes;

      // 3. Seed Developer Panel Modules
      const modulesRes = await fetch(`${baseUrl}/api/seed/modules`).then((r) => r.json());
      results.developerModules = modulesRes;

      // 4. Seed Website Storefront & Control Panel Modules
      const websiteModulesRes = await fetch(`${baseUrl}/api/seed/website-modules`).then((r) => r.json());
      results.websiteModules = websiteModulesRes;

      return NextResponse.json({
        success: true,
        message: 'All seeds executed successfully in sequence!',
        results,
      });
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          error: err.message || 'Error running sequential seed orchestrator',
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Database Seed Endpoints',
    endpoints: [
      {
        path: '/api/seed/tables',
        description: 'Applies postgresql/schema.psql (56 platform tables) & website_tables.psql (339 tenant tables)',
        methods: ['GET', 'POST'],
      },
      {
        path: '/api/seed/developer',
        description: 'Seeds system roles, platform permissions, and creates first Super Admin developer',
        methods: ['GET', 'POST'],
        optionalParams: { name: 'string', email: 'string', password: 'string' },
      },
      {
        path: '/api/seed/modules',
        description: 'Seeds all 38 developer backoffice modules & RBAC permissions from the developer panel',
        methods: ['GET', 'POST'],
      },
      {
        path: '/api/seed/website-modules',
        description: 'Seeds all 75 storefront & control panel modules into website_modules table',
        methods: ['GET', 'POST'],
        optionalParams: { website_id: 'number', domain: 'string' },
      },
      {
        path: '/api/seed?all=true',
        description: 'Executes all 4 seed steps in sequential order in a single request',
        methods: ['GET', 'POST'],
      },
    ],
  });
}

export async function POST(request) {
  return await GET(request);
}
