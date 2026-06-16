export default function FunFactCard({ fact }) {
  return (
    <div className="flex-shrink-0 w-64 bg-card border border-white/10 rounded-2xl p-4 snap-start">
      {fact.image && (
        <img src={fact.image} alt={fact.title} className="w-full h-28 object-cover rounded-xl mb-3" />
      )}
      {!fact.image && (
        <div className="w-full h-12 flex items-center justify-center text-3xl mb-3">💡</div>
      )}
      <h4 className="text-white font-semibold text-sm mb-1">{fact.title}</h4>
      <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">{fact.description}</p>
    </div>
  );
}
