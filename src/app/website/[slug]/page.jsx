'use client';

import { use, useEffect, useState } from 'react';
import TenantNavbar from '@/components/website/bars/TenantNavbar';
import TenantHero from '@/components/website/cards/TenantHero';
import TenantServices from '@/components/website/cards/TenantServices';
import TenantExperiences from '@/components/website/cards/TenantExperiences';
import TenantProducts from '@/components/website/cards/TenantProducts';
import TenantGallery from '@/components/website/cards/TenantGallery';
import TenantBlogs from '@/components/website/cards/TenantBlogs';
import TenantAppointments from '@/components/website/forms/TenantAppointments';
import TenantContact from '@/components/website/forms/TenantContact';
import TenantFooter from '@/components/website/bars/TenantFooter';
import { BiLoaderAlt, BiShoppingBag, BiX } from 'react-icons/bi';

export default function TenantWebsiteHomePage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  useEffect(() => {
    fetch(`/api/webites/${slug}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        } else {
          setError(resData.error || 'Website not found');
        }
      })
      .catch((err) => setError('Failed to load website'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = (product) => {
    setCart((prev) => [...prev, product]);
    setCartOpen(true);
  };

  const handleRemoveFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 gap-3">
        <BiLoaderAlt className="animate-spin text-4xl text-slate-800 dark:text-slate-200" />
        <p className="text-xs font-semibold tracking-wider uppercase">Loading Website...</p>
      </div>
    );
  }

  if (error || !data?.website) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center text-3xl font-bold">
          !
        </div>
        <h1 className="text-2xl font-black">Website Not Found</h1>
        <p className="text-xs text-slate-500 max-w-sm">
          {error || `The tenant website "${slug}" is either inactive, unpublished, or has not been provisioned yet.`}
        </p>
      </div>
    );
  }

  const { website, services, products, blogs, experiences, gallery, skills } = data;
  const settings = website.settings || {};
  const primaryColor = settings.primary_color || website.theme_config?.primaryColor || '#6366f1';
  const fontFamily = settings.font_family || website.theme_config?.fontFamily || 'Inter';

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price_in_cents || 0) / 100), 0);

  return (
    <div
      className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
      style={{ fontFamily }}
    >
      {/* Dynamic CSS variable injection */}
      <style jsx global>{`
        :root {
          --primary: ${primaryColor};
        }
      `}</style>

      {/* Header */}
      <TenantNavbar
        website={website}
        cartCount={cart.length}
        onOpenCart={() => setCartOpen(true)}
      />

      <main className="space-y-4">
        {/* Hero */}
        <TenantHero website={website} />

        {/* Services */}
        {services?.length > 0 && (
          <TenantServices
            services={services}
            primaryColor={primaryColor}
            onSelectService={(serviceTitle) => setSelectedService(serviceTitle)}
          />
        )}

        {/* Experiences & Skills */}
        {(experiences?.length > 0 || skills?.length > 0) && (
          <TenantExperiences
            experiences={experiences}
            skills={skills}
            primaryColor={primaryColor}
          />
        )}

        {/* Products / Store */}
        {products?.length > 0 && (
          <TenantProducts
            products={products}
            primaryColor={primaryColor}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* Portfolio Gallery */}
        {gallery?.length > 0 && (
          <TenantGallery gallery={gallery} primaryColor={primaryColor} />
        )}

        {/* Blogs / Insights */}
        {blogs?.length > 0 && (
          <TenantBlogs blogs={blogs} primaryColor={primaryColor} />
        )}

        {/* Appointments Calendar */}
        <TenantAppointments
          websiteId={website.id}
          services={services}
          primaryColor={primaryColor}
          preselectedService={selectedService}
        />

        {/* Contact Form */}
        <TenantContact
          websiteId={website.id}
          settings={settings}
          primaryColor={primaryColor}
        />
      </main>

      {/* Footer */}
      <TenantFooter website={website} />

      {/* Slide-over Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BiShoppingBag className="text-xl" style={{ color: primaryColor }} />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Shopping Cart ({cart.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <BiX className="text-2xl" />
                </button>
              </div>

              {cart.length > 0 ? (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <strong className="block text-slate-900 dark:text-white font-semibold">
                          {item.name}
                        </strong>
                        <span className="text-slate-500">
                          ${(Number(item.price_in_cents || 0) / 100).toFixed(2)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(idx)}
                        className="text-rose-600 hover:text-rose-700 text-xs font-semibold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-xs text-slate-400">
                  Your cart is currently empty.
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white">
                  <span>Subtotal:</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <a
                  href="#products"
                  onClick={() => setCartOpen(false)}
                  className="w-full py-3 rounded-full text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  style={{ backgroundColor: primaryColor }}
                >
                  Proceed to Checkout
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
