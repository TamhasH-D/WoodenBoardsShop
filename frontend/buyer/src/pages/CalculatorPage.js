import React from 'react';
import Layout from '../components/layout/Layout';
import PriceCalculator from '../components/calculator/PriceCalculator';
import Card from '../components/ui/Card';

// Mock data for demonstration
const mockWoodTypes = [
  { id: '1', name: 'Сосна', pricePerM3: 7500 },
  { id: '2', name: 'Дуб', pricePerM3: 25000 },
  { id: '3', name: 'Берёза', pricePerM3: 12000 },
  { id: '4', name: 'Лиственница', pricePerM3: 15000 },
];

const CalculatorPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-wood-text mb-8">Калькулятор стоимости</h1>
        
        {/* Introduction */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold text-wood-text mb-4">Как пользоваться калькулятором</h2>
          <ol className="list-decimal list-inside space-y-2 text-wood-text">
            <li>Выберите тип древесины из выпадающего списка</li>
            <li>Выберите способ расчета: по объему или по размерам</li>
            <li>Введите необходимые параметры</li>
            <li>Получите расчет стоимости</li>
          </ol>
          <p className="mt-4 text-gray-600">
            Обратите внимание, что расчет является приблизительным. Для получения точной стоимости, 
            пожалуйста, свяжитесь с нашими менеджерами.
          </p>
        </Card>
        
        {/* Calculator */}
        <div className="mb-12">
          <PriceCalculator woodTypes={mockWoodTypes} />
        </div>
        
        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-wood-accent bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-wood-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-wood-text mb-2">Индивидуальный расчет</h3>
              <p className="text-gray-600">
                Для сложных проектов мы предлагаем индивидуальный расчет стоимости с учетом всех особенностей.
              </p>
            </div>
          </Card>
          
          <Card>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-wood-accent bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-wood-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-wood-text mb-2">Гибкая система скидок</h3>
              <p className="text-gray-600">
                При заказе больших объемов предоставляются скидки. Уточняйте у менеджеров.
              </p>
            </div>
          </Card>
          
          <Card>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-wood-accent bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-wood-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-wood-text mb-2">Консультация специалиста</h3>
              <p className="text-gray-600">
                Наши специалисты помогут выбрать оптимальный материал для вашего проекта.
              </p>
            </div>
          </Card>
        </div>
        
        {/* FAQ Section */}
        <Card>
          <h2 className="text-xl font-semibold text-wood-text mb-6">Часто задаваемые вопросы</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-wood-text mb-2">Как рассчитывается объем древесины?</h3>
              <p className="text-gray-600">
                Объем древесины рассчитывается по формуле: длина × ширина × высота (в метрах). 
                Результат выражается в кубических метрах (м³).
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-wood-text mb-2">Учитывает ли калькулятор стоимость доставки?</h3>
              <p className="text-gray-600">
                Нет, калькулятор показывает только стоимость материала. Стоимость доставки рассчитывается 
                отдельно в зависимости от адреса и объема заказа.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-wood-text mb-2">Могу ли я заказать нестандартные размеры?</h3>
              <p className="text-gray-600">
                Да, мы предлагаем услуги распила по индивидуальным размерам. Для расчета стоимости 
                такой услуги, пожалуйста, свяжитесь с нашими менеджерами.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-wood-text mb-2">Как долго действуют указанные цены?</h3>
              <p className="text-gray-600">
                Цены на древесину могут меняться в зависимости от рыночной ситуации. Актуальные цены 
                всегда можно уточнить у наших менеджеров.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default CalculatorPage;
