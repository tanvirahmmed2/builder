# Database Tables List

### schema.psql (56 tables)
 
1. developers
2. permissions
3. roles
4. role_permissions
5. developer_roles
6. session
7. login_activity
8. project
9. project_messages
10. project_images
11. blogs
12. blogs_image
13. live_chats
14. live_chat_messages
15. contacts
16. support
17. support_messages
18. support_images
19. creators
20. creator_sessions
21. creator_login_activity
22. services
23. service_images
24. service_modules
25. service_themes
26. packages
27. package_modules
28. purchases
29. payment
30. payment_transactions
31. subscription
32. websites
33. tutorials
34. reports
35. leads
36. subscribers
37. faqs
38. updates
39. reviews
40. payrolls
41. developer_payrolls
42. payroll_payments
43. internal_chats
44. chat_participants
45. chat_messages
46. chat_images
47. tasks
48. task_comments
49. notices
50. meta_conversations
51. meta_messages
52. career
53. career_application
54. career_applicants
55. career_applicant_info
56. policies

---

### website_tables.psql (339 tables)

# Universal Tables

## 1. Universal Core Tenant & System Configuration
1. website_settings
2. website_themes
3. website_modules
4. website_navigation
5. website_pages
6. website_page_sections
7. website_page_seo
8. website_media
9. website_media_folders
10. website_media_variants
11. website_branches
12. website_currencies
13. website_taxes
14. website_tax_zones
15. website_tax_classes
16. website_payment_gateways
17. website_payment_gateway_accounts
18. website_policies
19. website_faqs
20. website_faq_categories
21. website_notices
22. website_activity_logs
23. website_audit_trails
24. website_custom_domains
25. website_dns_records
26. website_system_notifications
27. website_languages
28. website_translations
29. website_custom_fields
30. website_custom_field_values

## 2. Universal Staff Identity, Roles & Access Control (RBAC) & Enterprise Security
31. website_roles
32. website_permissions
33. website_role_permissions
34. website_staffs
35. website_staff_roles
36. website_staff_sessions
37. website_staff_login_activity
38. website_staff_two_factor_auth
39. website_staff_audit_logs
40. website_staff_payrolls
41. website_staff_salary_payments
42. website_sso_providers
43. website_sso_mappings
44. website_api_keys
45. website_api_logs
46. website_ip_rules

## 3. Universal Client Identity, Auth & Customer Accounts
47. website_users
48. website_user_profiles
49. website_user_addresses
50. website_user_sessions
51. website_user_login_activity
52. website_user_two_factor_auth
53. website_user_password_resets
54. website_user_activity_logs
55. website_user_device_tokens
56. website_customers
57. website_customer_segments
58. website_customer_segment_members
59. website_compliance_consents
60. website_data_export_requests

## 4. Universal Accounting, Finance, Invoicing, Tali Khata & Treasury
61. website_chart_of_accounts
62. website_journal_entries
63. website_journal_entry_lines
64. website_invoices
65. website_invoice_items
66. website_credit_notes
67. website_credit_note_items
68. website_payments
69. website_payment_transactions
70. website_payment_webhooks
71. website_refund_transactions
72. website_tali_parties
73. website_tali_ledgers
74. website_tali_transactions
75. website_tali_reminders
76. website_balance_transactions
77. website_profit_transfers
78. website_cash_registers
79. website_cash_register_sessions
80. website_investors
81. website_investments
82. website_shares
83. website_withdrawals
84. website_withdrawal_transactions
85. website_expense_categories
86. website_expenses
87. website_expense_items
88. website_expense_payments

## 5. Universal Marketing, CRM, Loyalty, Affiliates & Support
89. website_coupons
90. website_coupon_redemptions
91. website_loyalty_programs
92. website_loyalty_tiers
93. website_loyalty_point_ledgers
94. website_loyalty_rewards
95. website_affiliates
96. website_affiliate_links
97. website_affiliate_commissions
98. website_affiliate_payouts
99. website_subscribers
100. website_email_logs
101. website_sms_gateways
102. website_sms_templates
103. website_sms_logs
104. website_support_tickets
105. website_support_messages
106. website_support_attachments
107. website_contacts
108. website_contact_replies
109. website_appointments
110. website_appointment_slots
111. website_reviews
112. website_review_images

## 6. Universal Enterprise Automation & Webhooks
113. website_automation_workflows
114. website_automation_triggers
115. website_automation_actions
116. website_automation_execution_logs
117. website_webhooks
118. website_webhook_deliveries

## 7. Universal Content, Blogs & Media Publishing
119. website_blogs
120. website_blog_categories
121. website_blog_tags
122. website_blog_post_tags
123. website_blog_images
124. website_blog_comments

## 8. Universal Tutorials & Knowledge Base
125. website_tutorial_categories
126. website_tutorials
127. website_tutorial_chapters
128. website_tutorial_steps

## 9. Universal Analytics, Traffic & Conversion Funnels
129. website_analytics_sessions
130. website_analytics_pageviews
131. website_analytics_events
132. website_analytics_conversions
133. website_analytics_funnels
134. website_analytics_search_queries
135. website_analytics_utm_trackers
136. website_analytics_daily_summaries

## 10. Universal Meta, Social Channels & Omnichannel Messaging
137. website_meta_accounts
138. website_facebook_pages
139. website_instagram_accounts
140. website_whatsapp_business_accounts
141. website_whatsapp_templates
142. website_meta_contacts
143. website_meta_conversations
144. website_meta_messages
145. website_meta_message_attachments
146. website_meta_auto_replies
147. website_meta_ad_campaigns
148. website_meta_ad_leads
149. website_meta_webhooks_logs

---

# Other Tables (Specific Website Types & Modular Capabilities)

## 11. Portfolio & Creative Showcase Module (Website Type 1)
150. website_portfolio_abouts
151. website_portfolio_work_experiences
152. website_portfolio_experience_technologies
153. website_portfolio_education
154. website_portfolio_skills
155. website_portfolio_skill_categories
156. website_portfolio_awards
157. website_portfolio_certifications
158. website_portfolio_categories
159. website_portfolio_projects
160. website_portfolio_project_images
161. website_portfolio_project_tech_tags
162. website_portfolio_project_testimonials
163. website_portfolio_project_milestones
164. website_portfolio_project_deliverables
165. website_portfolio_services
166. website_portfolio_service_pricing_plans
167. website_portfolio_testimonials
168. website_portfolio_partners
169. website_portfolio_videos
170. website_portfolio_inquiries
171. website_portfolio_proposals
172. website_portfolio_contracts

## 12. Multi-Store E-Commerce & Retail Module (Website Type 2)
173. website_ecommerce_categories
174. website_ecommerce_brands
175. website_ecommerce_tags
176. website_ecommerce_products
177. website_ecommerce_product_attributes
178. website_ecommerce_product_attribute_values
179. website_ecommerce_product_variants
180. website_ecommerce_product_bundles
181. website_ecommerce_bundle_items
182. website_ecommerce_product_images
183. website_ecommerce_product_videos
184. website_ecommerce_product_stocks
185. website_ecommerce_product_batches
186. website_ecommerce_serial_numbers
187. website_ecommerce_stock_transfers
188. website_ecommerce_stock_adjustments
189. website_ecommerce_price_lists
190. website_ecommerce_price_list_rules
191. website_ecommerce_b2b_quotes
192. website_ecommerce_b2b_quote_items
193. website_ecommerce_shipping_zones
194. website_ecommerce_shipping_rates
195. website_ecommerce_shipping_carriers
196. website_ecommerce_fulfillment_orders
197. website_ecommerce_pick_lists
198. website_ecommerce_pack_lists
199. website_ecommerce_dispatch_manifests
200. website_ecommerce_carts
201. website_ecommerce_cart_items
202. website_ecommerce_wishlists
203. website_ecommerce_orders
204. website_ecommerce_order_items
205. website_ecommerce_order_tracking
206. website_ecommerce_order_notes
207. website_ecommerce_order_refunds
208. website_ecommerce_order_refund_items
209. website_ecommerce_preorders
210. website_ecommerce_backorders
211. website_ecommerce_suppliers
212. website_ecommerce_supplier_products
213. website_ecommerce_purchases
214. website_ecommerce_purchase_items
215. website_ecommerce_purchase_payments

## 13. Restaurant, Cafe, Cloud POS & Kitchen Display System (KDS) Module (Website Type 3)
216. website_restaurant_menus
217. website_restaurant_categories
218. website_restaurant_menu_items
219. website_restaurant_item_variants
220. website_restaurant_modifier_groups
221. website_restaurant_modifiers
222. website_restaurant_item_modifier_groups
223. website_restaurant_item_combos
224. website_restaurant_ingredients
225. website_restaurant_recipes
226. website_restaurant_recipe_ingredients
227. website_restaurant_ingredient_stocks
228. website_restaurant_ingredient_wastages
229. website_restaurant_floor_plans
230. website_restaurant_tables
231. website_restaurant_table_qr_codes
232. website_restaurant_table_reservations
233. website_restaurant_pos_shifts
234. website_restaurant_pos_offline_sync_logs
235. website_restaurant_kitchen_stations
236. website_restaurant_kitchen_order_routing
237. website_restaurant_kds_tickets
238. website_restaurant_orders
239. website_restaurant_order_items
240. website_restaurant_order_item_modifiers
241. website_restaurant_split_bills
242. website_restaurant_split_bill_items
243. website_restaurant_waiters
244. website_restaurant_delivery_integrations

## 14. Organization, Company Directory, HR & Team Management Module (Website Type 4)
245. website_org_departments
246. website_org_designations
247. website_org_members
248. website_org_hierarchy
249. website_org_shifts
250. website_org_shift_schedules
251. website_org_attendance_records
252. website_org_leave_types
253. website_org_leave_requests
254. website_org_assets
255. website_org_asset_assignments
256. website_org_performance_goals
257. website_org_performance_reviews
258. website_org_training_programs
259. website_org_training_enrollments
260. website_org_announcements
261. website_org_policies
262. website_org_jobs
263. website_org_job_applications
264. website_org_candidates
265. website_org_interview_rounds
266. website_org_onboarding_tasks
267. website_org_documents

## 15. Tour, Travel & Hospitality Management Module
268. website_tour_categories
269. website_tour_spots
270. website_tour_spots_images
271. website_tour_packages
272. website_tour_package_itineraries
273. website_tour_package_inclusions
274. website_tour_package_images
275. website_tour_schedule
276. website_tour_features
277. website_tour_pricing_tiers
278. website_tour_custom_inquiries
279. website_tour_custom_quotations
280. website_tour_bookings
281. website_tour_booking_passengers
282. website_tour_cancellation_policies
283. website_tour_insurance_plans
284. website_tour_visas
285. website_tour_visa_applications
286. website_tour_guides
287. website_tour_guide_assignments
288. website_tour_hotels
289. website_tour_hotel_rooms
290. website_tour_hotel_room_rates
291. website_tour_hotel_room_availability
292. website_tour_hotel_bookings

## 16. Real Estate & Property Management Module
293. website_real_estate_developments
294. website_real_estate_buildings
295. website_real_estate_building_floors
296. website_real_estate_properties
297. website_real_estate_specifications
298. website_real_estate_locations
299. website_real_estate_amenities
300. website_real_estate_property_amenities
301. website_real_estate_floor_plans
302. website_real_estate_property_images
303. website_real_estate_property_videos
304. website_real_estate_virtual_tours
305. website_real_estate_agents
306. website_real_estate_property_agents
307. website_real_estate_commissions
308. website_real_estate_commission_splits
309. website_real_estate_viewing_bookings
310. website_real_estate_offers
311. website_real_estate_leases
312. website_real_estate_lease_payments
313. website_real_estate_maintenance_requests
314. website_real_estate_maintenance_contractors
315. website_real_estate_work_orders
316. website_real_estate_hoa_fees

## 17. Transport, Fleet, Ticketing & Vehicle Rental Module
317. website_transport_routes
318. website_transport_stations
319. website_transport_route_stations
320. website_transport_vehicle_types
321. website_transport_vehicles
322. website_transport_vehicle_maintenances
323. website_transport_fuel_logs
324. website_transport_seat_layouts
325. website_transport_vehicle_seats
326. website_transport_drivers
327. website_transport_driver_shifts
328. website_transport_trips
329. website_transport_trip_schedules
330. website_transport_trip_manifests
331. website_transport_trip_fares
332. website_transport_bookings
333. website_transport_booking_seats
334. website_transport_passengers
335. website_transport_parcels
336. website_transport_parcel_trackings
337. website_transport_car_rentals
338. website_transport_car_rental_plans
339. website_transport_car_rental_bookings
