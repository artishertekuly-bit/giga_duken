-- Add categories and products for the new PC component items.

-- Seed categories if they do not already exist.
INSERT INTO public.categories (name_kz, slug, icon, description_kz, sort_order)
VALUES
  ('Процессорлар', 'cpu', 'cpu', 'Intel және AMD процессорлары', 10),
  ('Видеокарталар', 'gpu', 'monitor', 'NVIDIA және AMD видеокарталары', 20),
  ('Жедел жад', 'ram', 'memory-stick', 'DDR4 және DDR5 жедел жадтар', 30),
  ('Материнскалар', 'motherboard', 'circuit-board', 'LGA1700 және AM5 материнскалар', 40),
  ('Дискілер', 'storage', 'hard-drive', 'NVMe және SATA дискілер', 50),
  ('Блок питание', 'psu', 'zap', 'Компьютер блок питания', 60),
  ('Корпустар', 'case', 'box', 'ATX және mATX корпустар', 70),
  ('Салқындатқыштар', 'cooling', 'wind', 'Air және AIO салқындатқыштар', 80)
ON CONFLICT (slug) DO NOTHING;

-- Insert products with category references.
INSERT INTO public.products (name_kz, slug, category_id, brand, model, price, stock, specs)
VALUES
  ('Intel Core i9-14900K', 'intel-core-i9-14900k', (SELECT id FROM public.categories WHERE slug = 'cpu'), 'Intel', 'Core i9-14900K', 285000, 20, '{"socket":"LGA1700","tdp":"125W","ddr":"DDR5"}'),
  ('Intel Core i5-13600K', 'intel-core-i5-13600k', (SELECT id FROM public.categories WHERE slug = 'cpu'), 'Intel', 'Core i5-13600K', 145000, 20, '{"socket":"LGA1700","tdp":"125W","ddr":"DDR4/DDR5"}'),
  ('AMD Ryzen 9 7950X', 'amd-ryzen-9-7950x', (SELECT id FROM public.categories WHERE slug = 'cpu'), 'AMD', 'Ryzen 9 7950X', 320000, 20, '{"socket":"AM5","tdp":"170W","ddr":"DDR5"}'),
  ('AMD Ryzen 5 7600X', 'amd-ryzen-5-7600x', (SELECT id FROM public.categories WHERE slug = 'cpu'), 'AMD', 'Ryzen 5 7600X', 125000, 20, '{"socket":"AM5","tdp":"105W","ddr":"DDR5"}'),
  ('Intel Core i3-13100', 'intel-core-i3-13100', (SELECT id FROM public.categories WHERE slug = 'cpu'), 'Intel', 'Core i3-13100', 75000, 20, '{"socket":"LGA1700","tdp":"60W","ddr":"DDR4/DDR5"}'),

  ('NVIDIA RTX 4090', 'nvidia-rtx-4090', (SELECT id FROM public.categories WHERE slug = 'gpu'), 'NVIDIA', 'RTX 4090', 620000, 15, '{"power":"450W"}'),
  ('NVIDIA RTX 4070 Ti', 'nvidia-rtx-4070-ti', (SELECT id FROM public.categories WHERE slug = 'gpu'), 'NVIDIA', 'RTX 4070 Ti', 310000, 15, '{"power":"285W"}'),
  ('NVIDIA RTX 4060', 'nvidia-rtx-4060', (SELECT id FROM public.categories WHERE slug = 'gpu'), 'NVIDIA', 'RTX 4060', 185000, 15, '{"power":"115W"}'),
  ('AMD RX 7900 XTX', 'amd-rx-7900-xtx', (SELECT id FROM public.categories WHERE slug = 'gpu'), 'AMD', 'RX 7900 XTX', 420000, 15, '{"power":"355W"}'),
  ('AMD RX 7600', 'amd-rx-7600', (SELECT id FROM public.categories WHERE slug = 'gpu'), 'AMD', 'RX 7600', 135000, 15, '{"power":"165W"}'),

  ('Corsair Vengeance 32GB DDR5-6000', 'corsair-vengeance-32gb-ddr5-6000', (SELECT id FROM public.categories WHERE slug = 'ram'), 'Corsair', 'Vengeance 32GB DDR5-6000', 85000, 25, '{"type":"DDR5","size":"32GB","speed":"6000MHz"}'),
  ('Kingston Fury 16GB DDR4-3200', 'kingston-fury-16gb-ddr4-3200', (SELECT id FROM public.categories WHERE slug = 'ram'), 'Kingston', 'Fury 16GB DDR4-3200', 38000, 25, '{"type":"DDR4","size":"16GB","speed":"3200MHz"}'),
  ('G.Skill Trident Z5 64GB DDR5', 'gskill-trident-z5-64gb-ddr5', (SELECT id FROM public.categories WHERE slug = 'ram'), 'G.Skill', 'Trident Z5 64GB DDR5', 145000, 25, '{"type":"DDR5","size":"64GB"}'),
  ('TeamGroup T-Force 16GB DDR5-5200', 'teamgroup-tforce-16gb-ddr5-5200', (SELECT id FROM public.categories WHERE slug = 'ram'), 'TeamGroup', 'T-Force 16GB DDR5-5200', 52000, 25, '{"type":"DDR5","size":"16GB","speed":"5200MHz"}'),
  ('Kingston ValueRAM 8GB DDR4-2666', 'kingston-valueram-8gb-ddr4-2666', (SELECT id FROM public.categories WHERE slug = 'ram'), 'Kingston', 'ValueRAM 8GB DDR4-2666', 22000, 25, '{"type":"DDR4","size":"8GB","speed":"2666MHz"}'),

  ('ASUS ROG Strix Z790-E', 'asus-rog-strix-z790-e', (SELECT id FROM public.categories WHERE slug = 'motherboard'), 'ASUS', 'ROG Strix Z790-E', 215000, 10, '{"socket":"LGA1700","ddr":"DDR5","form":"ATX"}'),
  ('MSI MAG B660M', 'msi-mag-b660m', (SELECT id FROM public.categories WHERE slug = 'motherboard'), 'MSI', 'MAG B660M', 95000, 10, '{"socket":"LGA1700","ddr":"DDR4","form":"mATX"}'),
  ('ASUS ROG Crosshair X670E', 'asus-rog-crosshair-x670e', (SELECT id FROM public.categories WHERE slug = 'motherboard'), 'ASUS', 'ROG Crosshair X670E', 280000, 10, '{"socket":"AM5","ddr":"DDR5","form":"ATX"}'),
  ('Gigabyte B650M DS3H', 'gigabyte-b650m-ds3h', (SELECT id FROM public.categories WHERE slug = 'motherboard'), 'Gigabyte', 'B650M DS3H', 88000, 10, '{"socket":"AM5","ddr":"DDR5","form":"mATX"}'),
  ('MSI PRO Z790-A', 'msi-pro-z790-a', (SELECT id FROM public.categories WHERE slug = 'motherboard'), 'MSI', 'PRO Z790-A', 155000, 10, '{"socket":"LGA1700","ddr":"DDR4/DDR5","form":"ATX"}'),

  ('Samsung 990 Pro 2TB NVMe SSD', 'samsung-990-pro-2tb-nvme-ssd', (SELECT id FROM public.categories WHERE slug = 'storage'), 'Samsung', '990 Pro 2TB NVMe SSD', 95000, 20, '{"interface":"PCIe 4.0","read":"7450MB/s"}'),
  ('WD Black SN850X 1TB NVMe SSD', 'wd-black-sn850x-1tb-nvme-ssd', (SELECT id FROM public.categories WHERE slug = 'storage'), 'WD', 'Black SN850X 1TB NVMe SSD', 68000, 20, '{"interface":"PCIe 4.0","read":"7300MB/s"}'),
  ('Seagate Barracuda 4TB HDD', 'seagate-barracuda-4tb-hdd', (SELECT id FROM public.categories WHERE slug = 'storage'), 'Seagate', 'Barracuda 4TB HDD', 42000, 20, '{"interface":"SATA","rpm":"5400"}'),
  ('Kingston A400 480GB SSD', 'kingston-a400-480gb-ssd', (SELECT id FROM public.categories WHERE slug = 'storage'), 'Kingston', 'A400 480GB SSD', 28000, 20, '{"interface":"SATA","read":"500MB/s"}'),
  ('Samsung 870 EVO 1TB SATA SSD', 'samsung-870-evo-1tb-sata-ssd', (SELECT id FROM public.categories WHERE slug = 'storage'), 'Samsung', '870 EVO 1TB SATA SSD', 52000, 20, '{"interface":"SATA","read":"560MB/s"}'),

  ('Corsair RM1000x 1000W 80+ Gold', 'corsair-rm1000x-1000w-80plus-gold', (SELECT id FROM public.categories WHERE slug = 'psu'), 'Corsair', 'RM1000x 1000W 80+ Gold', 95000, 15, '{"wattage":"1000W","efficiency":"80+ Gold"}'),
  ('be quiet! Straight Power 850W', 'be-quiet-straight-power-850w', (SELECT id FROM public.categories WHERE slug = 'psu'), 'be quiet!', 'Straight Power 850W', 78000, 15, '{"wattage":"850W"}'),
  ('EVGA SuperNOVA 750W', 'evga-supernova-750w', (SELECT id FROM public.categories WHERE slug = 'psu'), 'EVGA', 'SuperNOVA 750W', 65000, 15, '{"wattage":"750W"}'),
  ('Cooler Master MWE 650W 80+ Bronze', 'cooler-master-mwe-650w-80plus-bronze', (SELECT id FROM public.categories WHERE slug = 'psu'), 'Cooler Master', 'MWE 650W 80+ Bronze', 42000, 15, '{"wattage":"650W","efficiency":"80+ Bronze"}'),
  ('Seasonic Focus GX-550W', 'seasonic-focus-gx-550w', (SELECT id FROM public.categories WHERE slug = 'psu'), 'Seasonic', 'Focus GX-550W', 55000, 15, '{"wattage":"550W"}'),

  ('Lian Li PC-O11 Dynamic EVO', 'lian-li-pc-o11-dynamic-evo', (SELECT id FROM public.categories WHERE slug = 'case'), 'Lian Li', 'PC-O11 Dynamic EVO', 115000, 12, '{"form":"ATX","color":"Black"}'),
  ('NZXT H7 Flow', 'nzxt-h7-flow', (SELECT id FROM public.categories WHERE slug = 'case'), 'NZXT', 'H7 Flow', 98000, 12, '{"form":"ATX","color":"White"}'),
  ('Fractal Design Meshify 2', 'fractal-design-meshify-2', (SELECT id FROM public.categories WHERE slug = 'case'), 'Fractal Design', 'Meshify 2', 105000, 12, '{"form":"ATX","feature":"Tempered glass"}'),
  ('Cooler Master TD500 Mesh', 'cooler-master-td500-mesh', (SELECT id FROM public.categories WHERE slug = 'case'), 'Cooler Master', 'TD500 Mesh', 72000, 12, '{"form":"ATX","feature":"ARGB fans included"}'),
  ('DeepCool CH510', 'deepcool-ch510', (SELECT id FROM public.categories WHERE slug = 'case'), 'DeepCool', 'CH510', 48000, 12, '{"form":"ATX/mATX","feature":"Budget option"}'),

  ('Noctua NH-D15', 'noctua-nh-d15', (SELECT id FROM public.categories WHERE slug = 'cooling'), 'Noctua', 'NH-D15', 68000, 15, '{"type":"Air","tdp":"250W","socket":"LGA1700/AM5"}'),
  ('be quiet! Dark Rock Pro 4', 'be-quiet-dark-rock-pro-4', (SELECT id FROM public.categories WHERE slug = 'cooling'), 'be quiet!', 'Dark Rock Pro 4', 58000, 15, '{"type":"Air","tdp":"250W","socket":"LGA1700/AM5"}'),
  ('Corsair H150i Elite LCD 360mm', 'corsair-h150i-elite-lcd-360mm', (SELECT id FROM public.categories WHERE slug = 'cooling'), 'Corsair', 'H150i Elite LCD 360mm', 145000, 15, '{"type":"AIO Liquid","radiator":"360mm"}'),
  ('NZXT Kraken X63 280mm', 'nzxt-kraken-x63-280mm', (SELECT id FROM public.categories WHERE slug = 'cooling'), 'NZXT', 'Kraken X63 280mm', 112000, 15, '{"type":"AIO Liquid","radiator":"280mm"}'),
  ('DeepCool AK620', 'deepcool-ak620', (SELECT id FROM public.categories WHERE slug = 'cooling'), 'DeepCool', 'AK620', 42000, 15, '{"type":"Air","tdp":"260W","socket":"LGA1700/AM5"}')
ON CONFLICT (slug) DO NOTHING;
