-- Insert sample products (e-commerce mock data)
INSERT INTO public.products (title, description, price, original_price, image_url, category, rating, review_count, in_stock) VALUES
('Laptop Dell XPS 13', 'Ultrabook potente con procesador Intel i7, 16GB RAM, 512GB SSD. Pantalla FHD de 13.3 pulgadas', 999.99, 1299.99, '/placeholder.svg?height=300&width=300', 'Electrónica', 4.8, 342, true),
('Auriculares Sony WH-1000XM4', 'Auriculares inalámbricos con cancelación de ruido, batería de 30 horas, Bluetooth 5.0', 349.99, 399.99, '/placeholder.svg?height=300&width=300', 'Audio', 4.9, 1203, true),
('Teléfono Samsung Galaxy S24', 'Smartphone flagship con pantalla AMOLED 6.1", procesador Snapdragon 8 Gen 3, cámara de 50MP', 799.99, 999.99, '/placeholder.svg?height=300&width=300', 'Móviles', 4.7, 567, true),
('Monitor LG 27" 4K', 'Monitor profesional con resolución 4K, panel IPS, 99% DCI-P3, ideal para edición', 599.99, 799.99, '/placeholder.svg?height=300&width=300', 'Electrónica', 4.6, 289, true),
('Cámara Canon EOS R5', 'Cámara mirrorless full-frame 45MP, video 8K, estabilización in-body, lentes intercambiables', 3899.99, 4499.99, '/placeholder.svg?height=300&width=300', 'Fotografía', 4.9, 421, true),
('Teclado Mecánico Corsair K95', 'Teclado gaming con switches mecánicos Cherry MX, iluminación RGB, 8 macropads programables', 199.99, 249.99, '/placeholder.svg?height=300&width=300', 'Accesorios', 4.8, 512, true),
('Mouse Logitech MX Master 3S', 'Ratón inalámbrico de precisión con rueda magnética, 8K DPI, conectividad multi-dispositivo', 99.99, 129.99, '/placeholder.svg?height=300&width=300', 'Accesorios', 4.9, 876, true),
('Tableta iPad Pro 12.9"', 'Tablet con procesador M2, pantalla Liquid Retina XDR, 128GB almacenamiento, soporte Pencil', 1099.99, 1299.99, '/placeholder.svg?height=300&width=300', 'Tablets', 4.8, 445, true),
('SSD Samsung 870 QVO 1TB', 'Unidad de estado sólido 2.5" SATA, velocidad 560MB/s lectura, confiabilidad de datos', 79.99, 99.99, '/placeholder.svg?height=300&width=300', 'Almacenamiento', 4.7, 234, true),
('Router WiFi 6 ASUS', 'Router inalámbrico 802.11ax, cobertura 2500 sq ft, puertos Gigabit, antenas externas de alta ganancia', 179.99, 229.99, '/placeholder.svg?height=300&width=300', 'Redes', 4.6, 167, true),
('Power Bank Anker 65W', 'Batería portátil 25000mAh, carga rápida 65W, compatible con múltiples dispositivos, pantalla LED', 59.99, 79.99, '/placeholder.svg?height=300&width=300', 'Accesorios', 4.8, 654, true),
('Smartwatch Apple Watch Series 9', 'Reloj inteligente con pantalla Retina siempre activa, sensor cardíaco ECG, GPS integrado, sumergible', 429.99, 499.99, '/placeholder.svg?height=300&width=300', 'Wearables', 4.7, 589, true),
('Webcam Logitech C920 Pro', 'Cámara web 1080p Full HD, enfoque automático, corrección de luz, micrófono integrado', 79.99, 99.99, '/placeholder.svg?height=300&width=300', 'Accesorios', 4.7, 345, true),
('Micrófono Blue Yeti', 'Micrófono USB condenser cardioide, captura de audio cristalina, múltiples patrones de sonido, soporte ajustable', 99.99, 129.99, '/placeholder.svg?height=300&width=300', 'Audio', 4.8, 421, true),
('Stand Monitor Ergonómico', 'Soporte ajustable para monitor, reduce fatiga ocular, espacio de almacenamiento, altura regulable', 39.99, 59.99, '/placeholder.svg?height=300&width=300', 'Accesorios', 4.6, 178, true);
