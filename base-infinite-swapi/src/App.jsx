import './App.css';
import { InfinitePeople } from './people/InfinitePeople';
import { InfiniteSpecies } from './species/InfiniteSpecies';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <h1>Infinite SWAPI</h1>
        <InfinitePeople />
        {/* <InfiniteSpecies /> */}
        <ReactQueryDevtools />
      </div>
    </QueryClientProvider>
  );
}

export default App;
