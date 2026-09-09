import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET() {
  try {
    const admins = dbStore.getAdmins();
    const packages = dbStore.getPackages();
    const features = dbStore.getFeatures();
    const subscriptions = dbStore.getSubscriptions();
    const payments = dbStore.getPayments();
    const reports = dbStore.getReports();

    return NextResponse.json({
      success: true,
      admins,
      packages,
      features,
      subscriptions,
      payments,
      reports,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. Create another admin
    if (action === 'create_admin') {
      const admin = dbStore.createAdmin(body.adminData);
      return NextResponse.json({ success: true, admin });
    }

    // 2. Create package
    if (action === 'create_package') {
      const pkg = dbStore.createPackage(body.packageData);
      return NextResponse.json({ success: true, package: pkg });
    }

    // 3. Create feature
    if (action === 'create_feature') {
      const feature = dbStore.createFeature(body.featureData);
      return NextResponse.json({ success: true, feature });
    }

    // 4. Respond to reports
    if (action === 'respond_report') {
      const rep = dbStore.respondToReport(body.reportId, {
        adminResponse: body.adminResponse,
        status: body.status || 'RESOLVED',
      });
      return NextResponse.json({ success: true, report: rep });
    }

    // 5. Recover admin password
    if (action === 'recover_admin') {
      const result = dbStore.recoverAdminPassword(body.email);
      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
