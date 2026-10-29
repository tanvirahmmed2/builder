# Database Tables List

### schema.psql (54 tables)
 
1. developers
2. permissions
3. roles
3. role_permissions
4. developer_roles
5. session
6. login_activity
7. 
8. 
9. 
10. blogs
11. blogs_image
12. live_chats
13. live_chat_messages
14. contacts
15. support
16. support_messages
17. support_images
18. creators
19. creator_sessions
20. creator_login_activity
21. services
22. service_images
23. service_modules
24. service_themes
25. packages
26. package_modules
27. purchases
28. payment
29. payment_transactions
30. subscription
31. websites
32. tutorials
33. reports
34. leads
35. subscribers
36. faqs
37. updates
38. reviews
39. payrolls
40. developer_payrolls
41. payroll_payments
42. internal_chats
43. chat_participants
44. chat_messages
45. chat_images
46. tasks
47. task_comments
48. notices
49. meta_conversations
50. meta_messages
51. career
52. career_application
53. career_applicants
54. career_applicant_info
55. policies

---

### website_tables.psql (44 tables)
1. website_settings
2. website_themes
3. website_theme_revisions
4. website_navigation
5. website_pages
6. website_page_versions
7. website_media_assets
8. website_media_folders
9. website_store_branches
10. website_currencies
11. website_exchange_rates
12. website_payment_gateways
13. website_payment_gateway_accounts
14. website_policies
15. website_faqs
16. website_faq_categories
17. website_notices
18. website_activity_logs
19. website_audit_trails
20. website_custom_domains
21. website_dns_records
22. website_system_notifications

## 2. Universal Staff Identity, Roles & Access Control (RBAC)
23. website_roles
24. website_role_permissions
25. website_staffs
26. website_staff_roles
27. website_staff_sessions
28. website_staff_login_activity
29. website_staff_two_factor_auth
30. website_staff_audit_logs
31. website_staff_payrolls
32. website_staff_salary_payments

## 3. Universal Client Identity, Auth & Customer Accounts
33. website_users
34. website_user_profiles
35. website_user_addresses
36. website_user_sessions
37. website_user_login_activity
38. website_user_two_factor_auth
39. website_user_groups
40. website_user_activity_logs
41. website_user_device_tokens

## 4. Universal Financial Engine, Gateway Orchestration & Tally Khata
42. website_chart_of_accounts
43. website_journal_entries
44. website_journal_entry_lines
45. website_payments
46. website_payment_transactions
47. website_payment_webhooks
48. website_refund_transactions
49. website_tali_parties
50. website_tali_ledgers
51. website_tali_transactions
52. website_tali_reminders
53. website_balance_transactions
54. website_profit_transfers
55. website_cash_registers
56. website_cash_register_sessions
57. website_investors
58. website_investments
59. website_shares
60. website_withdrawals
61. website_withdrawal_transactions
62. website_expense_categories
63. website_expenses
64. website_expense_items
65. website_expense_payments

## 5. Universal Marketing, Coupons, Loyalty & Support
66. website_coupons
67. website_coupon_redemptions
68. website_loyalty_programs
69. website_loyalty_point_ledgers
70. website_loyalty_rewards
71. website_email_campaigns
72. website_email_subscribers
73. website_email_logs
74. website_sms_gateways
75. website_sms_campaigns
76. website_sms_logs
77. website_support_tickets
78. website_support_messages
79. website_support_attachments
80. website_contacts
81. website_contact_replies
82. website_appointments
83. website_appointment_slots
84. website_reviews
85. website_review_images

## 6. Personal Portfolio Vertical
86. website_portfolio_abouts
87. website_portfolio_work_experiences
88. website_portfolio_experience_technologies
89. website_portfolio_education
90. website_portfolio_skills
91. website_portfolio_skill_categories
92. website_portfolio_awards
93. website_portfolio_certifications
94. website_portfolio_projects
95. website_portfolio_project_images
96. website_portfolio_project_tech_tags
97. website_portfolio_project_testimonials
98. website_portfolio_services
99. website_portfolio_service_pricing_plans
100. website_portfolio_testimonials
101. website_portfolio_partners
102. website_portfolio_videos

## 7. E-Commerce Vertical
103. website_ecommerce_categories
104. website_ecommerce_brands
105. website_ecommerce_tags
106. website_ecommerce_products
107. website_ecommerce_product_attributes
108. website_ecommerce_product_attribute_values
109. website_ecommerce_product_variants
110. website_ecommerce_product_images
111. website_ecommerce_product_videos
112. website_ecommerce_product_stocks
113. website_ecommerce_stock_transfers
114. website_ecommerce_stock_adjustments
115. website_ecommerce_shipping_zones
116. website_ecommerce_shipping_rates
117. website_ecommerce_shipping_carriers
118. website_ecommerce_carts
119. website_ecommerce_cart_items
120. website_ecommerce_wishlists
121. website_ecommerce_orders
122. website_ecommerce_order_items
123. website_ecommerce_order_tracking
124. website_ecommerce_order_notes
125. website_ecommerce_order_refunds
126. website_ecommerce_order_refund_items
127. website_ecommerce_suppliers
128. website_ecommerce_supplier_products
129. website_ecommerce_purchases
130. website_ecommerce_purchase_items
131. website_ecommerce_purchase_payments

## 8. Restaurant & Food Service Vertical
132. website_restaurant_menus
133. website_restaurant_menu_categories
134. website_restaurant_menu_items
135. website_restaurant_item_modifiers
136. website_restaurant_modifier_options
137. website_restaurant_item_combos
138. website_restaurant_dining_tables
139. website_restaurant_table_qr_codes
140. website_restaurant_table_reservations
141. website_restaurant_kds_stations
142. website_restaurant_kds_tickets
143. website_restaurant_kds_ticket_items
144. website_restaurant_food_orders
145. website_restaurant_food_order_items

## 9. Tour & Travel Management Vertical
146. website_tour_destinations
147. website_tour_packages
148. website_tour_itineraries
149. website_tour_departures
150. website_tour_pricing_tiers
151. website_tour_included_features
152. website_tour_excluded_features
153. website_tour_bookings
154. website_tour_travelers
155. website_tour_traveler_documents
156. website_tour_guides
157. website_tour_guide_assignments
158. website_tour_hotels
159. website_tour_hotel_bookings

## 10. Real Estate Agency Vertical
160. website_real_estate_properties
161. website_real_estate_specifications
162. website_real_estate_locations
163. website_real_estate_amenities
164. website_real_estate_property_amenities
165. website_real_estate_floor_plans
166. website_real_estate_property_images
167. website_real_estate_property_videos
168. website_real_estate_virtual_tours
169. website_real_estate_agents
170. website_real_estate_viewing_bookings
171. website_real_estate_offers
172. website_real_estate_leases
173. website_real_estate_lease_payments

## 11. Transport System Management Vertical (Bus, Car, Logistics)
174. website_transport_routes
175. website_transport_route_stations
176. website_transport_stations
177. website_transport_vehicle_types
178. website_transport_vehicles
179. website_transport_seat_layouts
180. website_transport_vehicle_seats
181. website_transport_drivers
182. website_transport_trips
183. website_transport_trip_schedules
184. website_transport_trip_fares
185. website_transport_bookings
186. website_transport_booking_seats
187. website_transport_passengers
188. website_transport_car_rentals
189. website_transport_car_rental_plans
190. website_transport_car_rental_bookings

## 12. Meta Ecosystem Integrations (FB, IG, WhatsApp)
191. website_meta_accounts
192. website_facebook_pages
193. website_instagram_accounts
194. website_whatsapp_business_accounts
195. website_whatsapp_templates
196. website_meta_contacts
197. website_meta_conversations
198. website_meta_messages
199. website_meta_message_attachments
200. website_meta_auto_replies
201. website_meta_ad_campaigns
202. website_meta_ad_leads
203. website_meta_webhooks_logs

## 13. Telemetry, Analytics & In-Site Content
204. website_analytics_sessions
205. website_analytics_pageviews
206. website_analytics_events
207. website_analytics_conversions
208. website_analytics_funnels
209. website_analytics_search_queries
210. website_analytics_utm_trackers
211. website_analytics_daily_summaries
212. website_blogs
213. website_blog_categories
214. website_blog_tags
215. website_blog_post_tags
216. website_blog_images
217. website_blog_comments
218. website_tutorials
219. website_tutorial_chapters
220. website_tutorial_steps