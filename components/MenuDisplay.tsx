import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Recipe {
  title: string;
  description?: string;
  ingredients?: {
    section: string;
    items: string[];
  }[];
  steps?: string[];
}

interface MenuData {
  menu?: string;
  main: (string | Recipe)[];
  side: (string | Recipe)[];
}

interface Props {
  menuData: MenuData;
  unit: 'metric' | 'us';
}

const CollapsibleCard = ({ title, content }: { title: string; content: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div className="border rounded-2xl shadow p-4 mb-4 cursor-pointer" layout onClick={() => setIsOpen(!isOpen)}>
      <motion.h3 className="text-lg font-semibold mb-2">{title}</motion.h3>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden text-sm text-gray-700"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const renderRecipe = (item: string | Recipe, unit: 'metric' | 'us') => {
  if (typeof item === 'string') {
    return <p>{item}</p>;
  }

  return (
    <div>
      {item.description && <p className="mb-2 italic">{item.description}</p>}

      {item.ingredients && (
        <div className="mb-2">
          <h4 className="font-medium">Ingredients:</h4>
          {item.ingredients.map((section, i) => (
            <div key={i} className="mb-1">
              <span className="font-semibold">{section.section}:</span>
              <ul className="list-disc list-inside">
                {section.items.map((ing, idx) => (
                  <li key={idx}>{ing}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {item.steps && (
        <div>
          <h4 className="font-medium">Steps:</h4>
          <ol className="list-decimal list-inside space-y-1">
            {item.steps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

const MenuDisplay: React.FC<Props> = ({ menuData, unit }) => {
  if (!menuData) return null;

  return (
    <div className="mt-6">
      {menuData.menu && <h2 className="text-xl font-bold mb-4">{menuData.menu}</h2>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-bold mb-2">Main Dishes</h3>
          {menuData.main.map((item, index) => (
            <CollapsibleCard key={index} title={typeof item === 'string' ? item : item.title} content={renderRecipe(item, unit)} />
          ))}
        </div>

        <div>
          <h3 className="text-lg font-bold mb-2">Side Dishes</h3>
          {menuData.side.map((item, index) => (
            <CollapsibleCard key={index} title={typeof item === 'string' ? item : item.title} content={renderRecipe(item, unit)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuDisplay;
