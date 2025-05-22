import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// Mock data for demonstration
const mockWoodTypes = [
  { 
    id: '1', 
    name: 'Сосна', 
    description: 'Сосна - хвойная порода древесины, широко используемая в строительстве благодаря своей доступности, легкости обработки и хорошим эксплуатационным характеристикам. Древесина сосны имеет желтоватый оттенок с характерным рисунком годичных колец.',
    pricePerM3: 7500,
    characteristics: [
      { name: 'Плотность', value: '500-520 кг/м³' },
      { name: 'Твердость', value: 'Средняя' },
      { name: 'Влагостойкость', value: 'Средняя' },
      { name: 'Стойкость к гниению', value: 'Средняя' }
    ],
    applications: ['Строительство', 'Мебель', 'Отделка', 'Столярные изделия'],
    imageSrc: 'https://via.placeholder.com/600x400?text=Сосна'
  },
  { 
    id: '2', 
    name: 'Дуб', 
    description: 'Дуб - лиственная порода древесины, ценящаяся за высокую прочность, долговечность и красивую текстуру. Древесина дуба имеет желтовато-коричневый цвет с выраженным рисунком годичных колец и медуллярных лучей.',
    pricePerM3: 25000,
    characteristics: [
      { name: 'Плотность', value: '690-750 кг/м³' },
      { name: 'Твердость', value: 'Высокая' },
      { name: 'Влагостойкость', value: 'Высокая' },
      { name: 'Стойкость к гниению', value: 'Высокая' }
    ],
    applications: ['Элитная мебель', 'Паркет', 'Лестницы', 'Двери'],
    imageSrc: 'https://via.placeholder.com/600x400?text=Дуб'
  },
  { 
    id: '3', 
    name: 'Берёза', 
    description: 'Берёза - лиственная порода древесины с однородной структурой и светлым желтоватым или красноватым оттенком. Древесина берёзы хорошо поддается обработке, имеет среднюю прочность и стойкость к износу.',
    pricePerM3: 12000,
    characteristics: [
      { name: 'Плотность', value: '650-670 кг/м³' },
      { name: 'Твердость', value: 'Средняя' },
      { name: 'Влагостойкость', value: 'Низкая' },
      { name: 'Стойкость к гниению', value: 'Низкая' }
    ],
    applications: ['Мебель', 'Фанера', 'Отделка', 'Токарные изделия'],
    imageSrc: 'https://via.placeholder.com/600x400?text=Берёза'
  },
  { 
    id: '4', 
    name: 'Лиственница', 
    description: 'Лиственница - хвойная порода древесины, отличающаяся высокой прочностью, долговечностью и устойчивостью к гниению. Древесина лиственницы имеет красивый золотисто-коричневый цвет, который со временем темнеет.',
    pricePerM3: 15000,
    characteristics: [
      { name: 'Плотность', value: '670-700 кг/м³' },
      { name: 'Твердость', value: 'Высокая' },
      { name: 'Влагостойкость', value: 'Очень высокая' },
      { name: 'Стойкость к гниению', value: 'Очень высокая' }
    ],
    applications: ['Наружная отделка', 'Террасная доска', 'Мостовые конструкции', 'Сауны'],
    imageSrc: 'https://via.placeholder.com/600x400?text=Лиственница'
  },
];

const WoodTypesPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-wood-text mb-8">Типы древесины</h1>
        
        {/* Introduction */}
        <div className="mb-12">
          <p className="text-lg text-wood-text mb-4">
            Выбор правильного типа древесины - важный шаг в любом строительном или отделочном проекте. 
            Каждая порода дерева обладает уникальными характеристиками, которые определяют её применение, 
            долговечность и внешний вид.
          </p>
          <p className="text-lg text-wood-text">
            Ниже представлены основные типы древесины, которые мы предлагаем. Для каждого типа указаны 
            характеристики, области применения и текущие цены.
          </p>
        </div>
        
        {/* Wood Types List */}
        <div className="space-y-12">
          {mockWoodTypes.map((woodType, index) => (
            <Card key={woodType.id} className={`overflow-hidden ${index % 2 === 0 ? '' : 'bg-wood-light bg-opacity-10'}`}>
              <div className="flex flex-col md:flex-row">
                {/* Image - Left on even, right on odd */}
                <div className={`md:w-1/3 ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                  <img 
                    src={woodType.imageSrc} 
                    alt={woodType.name} 
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                
                {/* Content - Right on even, left on odd */}
                <div className={`md:w-2/3 p-6 ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                  <h2 className="text-2xl font-bold text-wood-dark mb-4">{woodType.name}</h2>
                  <p className="text-wood-text mb-6">{woodType.description}</p>
                  
                  {/* Characteristics */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-wood-text mb-3">Характеристики</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {woodType.characteristics.map((char, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-gray-600">{char.name}:</span>
                          <span className="font-medium text-wood-text">{char.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Applications */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-wood-text mb-3">Применение</h3>
                    <div className="flex flex-wrap gap-2">
                      {woodType.applications.map((app, i) => (
                        <span key={i} className="bg-wood-medium bg-opacity-10 text-wood-dark px-3 py-1 rounded-full text-sm">
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Price and Action */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6">
                    <div className="mb-4 sm:mb-0">
                      <span className="text-gray-600">Цена от:</span>
                      <span className="text-2xl font-bold text-wood-dark ml-2">
                        {woodType.pricePerM3.toLocaleString('ru-RU')} ₽/м³
                      </span>
                    </div>
                    <div className="flex space-x-3">
                      <Link to={`/products?woodType=${woodType.id}`}>
                        <Button variant="primary">Товары из {woodType.name}</Button>
                      </Link>
                      <Link to={`/calculator?woodType=${woodType.id}`}>
                        <Button variant="outline">Рассчитать стоимость</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default WoodTypesPage;
