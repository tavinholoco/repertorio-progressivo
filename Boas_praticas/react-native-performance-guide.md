# React Native — Guia de Otimização de Performance

> Referência completa para construir apps React Native mais leves, rápidos e com boa experiência em dispositivos de entrada. Baseado nas práticas mais recomendadas pela comunidade e pela documentação oficial em 2025.

---

## Índice

1. [Fundamentos: Como o React Native Processa Frames](#1-fundamentos-como-o-react-native-processa-frames)
2. [Hermes — O Motor JavaScript Certo](#2-hermes--o-motor-javascript-certo)
3. [Evitando Re-renders Desnecessários](#3-evitando-re-renders-desnecessários)
4. [Otimização de Listas](#4-otimização-de-listas)
5. [Imagens e Assets](#5-imagens-e-assets)
6. [Animações Performáticas](#6-animações-performáticas)
7. [Gerenciamento de Estado Eficiente](#7-gerenciamento-de-estado-eficiente)
8. [Redução do Bundle Size](#8-redução-do-bundle-size)
9. [Gerenciamento de Memória e Prevenção de Leaks](#9-gerenciamento-de-memória-e-prevenção-de-leaks)
10. [Navegação Otimizada](#10-navegação-otimizada)
11. [Rede e Requisições](#11-rede-e-requisições)
12. [Ferramentas de Profiling e Diagnóstico](#12-ferramentas-de-profiling-e-diagnóstico)
13. [Configurações de Build para Produção](#13-configurações-de-build-para-produção)
14. [Checklist de Performance](#14-checklist-de-performance)

---

## 1. Fundamentos: Como o React Native Processa Frames

Antes de otimizar, é preciso entender o que está acontecendo por baixo dos panos.

### 1.1 As Duas Threads Principais

O React Native opera com duas threads críticas que precisam entregar trabalho em **16.67ms cada** para manter 60 FPS:

- **JS Thread**: Executa a lógica de negócio, gerencia estado, processa eventos de toque e faz chamadas de API. Quando está sobrecarregada, o app parece "travado" — toques não respondem e transições travam.
- **UI Thread (Main Thread)**: Renderiza componentes nativos, executa animações nativas e gerencia o scroll. Quando está sobrecarregada, animações ficam com "jank" e o scroll engasga.

### 1.2 A Regra de Ouro

> **Meça antes de otimizar.** Otimização prematura é a raiz de complexidade desnecessária. Use profiling para identificar o gargalo real — JS thread, UI thread ou memória — e então aplique a técnica certa.

### 1.3 Sempre teste em Release Build

O modo de desenvolvimento adiciona warnings, verificações de tipo e ferramentas de debug que tornam o app significativamente mais lento. Qualquer medição de performance deve ser feita com build de release em um dispositivo físico, nunca no emulador em modo dev.

---

## 2. Hermes — O Motor JavaScript Certo

Hermes é o engine JavaScript otimizado especificamente para React Native. Desde as versões mais recentes, vem habilitado por padrão em projetos novos.

### 2.1 Benefícios medidos

| Métrica | Sem Hermes | Com Hermes | Melhoria |
|---|---|---|---|
| Tempo de startup | ~4.5s | ~2.5s | ~45% mais rápido |
| Uso de memória | ~185MB | ~130MB | ~30% menos |
| Tamanho do app | ~42MB | ~35MB | ~17% menor |

### 2.2 Como verificar se está habilitado

```javascript
// Em qualquer componente, para debug:
const isHermes = () => !!global.HermesInternal;
console.log('Hermes habilitado:', isHermes());
```

### 2.3 Configuração

**Android** — `android/app/build.gradle`:
```groovy
project.ext.react = [
    enableHermes: true
]
```

**iOS** — `ios/Podfile`:
```ruby
use_react_native!(
  :hermes_enabled => true
)
```

### 2.4 Dica importante

Após habilitar Hermes, sempre rode `cd ios && pod install` e faça um clean build. Hermes compila JavaScript para bytecode ahead-of-time, o que é a principal razão da melhoria no startup.

---

## 3. Evitando Re-renders Desnecessários

Re-renders excessivos são a causa mais comum de lentidão em apps React Native. Cada re-render gasta tempo da JS thread e, se acontecer durante uma animação ou scroll, o usuário sente.

### 3.1 React.memo — Memoize componentes

Envolva componentes que recebem as mesmas props frequentemente com `React.memo`. Isso faz o React pular o re-render se as props não mudaram.

```tsx
// ❌ Ruim: re-renderiza toda vez que o pai re-renderiza
const MusicCard = ({ title, artist }) => (
  <View>
    <Text>{title}</Text>
    <Text>{artist}</Text>
  </View>
);

// ✅ Bom: só re-renderiza se title ou artist mudarem
const MusicCard = React.memo(({ title, artist }) => (
  <View>
    <Text>{title}</Text>
    <Text>{artist}</Text>
  </View>
));
```

### 3.2 useCallback — Estabilize referências de funções

Funções definidas inline criam uma nova referência a cada render, fazendo componentes memoizados re-renderizarem sem necessidade.

```tsx
// ❌ Ruim: nova função a cada render
const Parent = () => {
  const handlePress = () => { /* ... */ };
  return <MemoizedChild onPress={handlePress} />;
};

// ✅ Bom: referência estável
const Parent = () => {
  const handlePress = useCallback(() => { /* ... */ }, []);
  return <MemoizedChild onPress={handlePress} />;
};
```

### 3.3 useMemo — Cache de cálculos caros

```tsx
// ❌ Ruim: filtra a lista inteira em todo render
const filteredSongs = songs.filter(s => s.genre === selectedGenre);

// ✅ Bom: só recalcula quando songs ou selectedGenre mudam
const filteredSongs = useMemo(
  () => songs.filter(s => s.genre === selectedGenre),
  [songs, selectedGenre]
);
```

### 3.4 React Compiler (futuro próximo)

O React Compiler, disponível a partir do Expo SDK 54+, automatiza a memoização. Quando disponível, ele pode reduzir re-renders desnecessários em 30-60% sem intervenção manual. Até lá, aplique `React.memo`, `useCallback` e `useMemo` estrategicamente.

### 3.5 Quando NÃO memoizar

- Componentes que sempre recebem props diferentes (memoizar adiciona overhead sem ganho).
- Componentes muito simples e leves (o custo da comparação pode superar o custo do render).
- Valores primitivos simples que já são comparados por valor.

---

## 4. Otimização de Listas

Listas são o maior gargalo de performance na maioria dos apps React Native. Uma lista mal configurada pode derrubar FPS para abaixo de 30 em dispositivos modestos.

### 4.1 FlashList > FlatList

O FlashList, desenvolvido pela Shopify, é a substituição recomendada para FlatList em 2025. Ele reutiliza views em vez de destruí-las e recriá-las (cell recycling), o que reduz drasticamente o trabalho da JS thread.

**Resultados medidos em dispositivo Android de baixo custo:**

| Métrica | FlatList | FlashList | Melhoria |
|---|---|---|---|
| FPS médio | ~37 | ~57 | +54% |
| CPU total | ~199% | ~37% | -82% |
| JS thread CPU | >90% | <10% | ~90% menos |
| Crashes por memória | Frequentes | Eliminados | — |

**Migração (é quase drop-in):**

```tsx
// Antes
import { FlatList } from 'react-native';

<FlatList
  data={repertoire}
  renderItem={renderItem}
  keyExtractor={item => item.id}
/>

// Depois
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={repertoire}
  renderItem={renderItem}
  estimatedItemSize={80}  // altura estimada do item em px
/>
```

### 4.2 Se continuar com FlatList, otimize

```tsx
const renderItem = useCallback(({ item }) => (
  <MemoizedRepertoireItem item={item} />
), []);

const keyExtractor = useCallback((item) => item.id, []);

const getItemLayout = useCallback((_, index) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index,
}), []);

<FlatList
  data={repertoire}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  getItemLayout={getItemLayout}       // pula cálculos de layout
  initialNumToRender={10}             // itens na primeira renderização
  maxToRenderPerBatch={5}             // itens por batch de scroll
  windowSize={10}                     // janela de renderização (em viewports)
  removeClippedSubviews={true}        // desanexa views fora da tela (Android)
/>
```

### 4.3 Regras para itens de lista performáticos

- **Mantenha o componente do item leve**: evite nesting profundo de Views.
- **Extraia renderItem para fora do JSX**: definir inline cria nova referência a cada render.
- **Não use key prop nos itens do FlashList**: isso desabilita o recycling.
- **Use imagens otimizadas**: imagens pesadas dentro de listas são a principal causa de scroll lento.
- **Evite funções arrow inline em props de eventos**: `onPress={() => handlePress(id)}` cria nova referência. Prefira `useCallback` ou passe o ID como prop.

---

## 5. Imagens e Assets

Imagens frequentemente representam 60-80% do peso de um app e são a maior causa de consumo de memória.

### 5.1 Use react-native-fast-image

O componente `Image` padrão do React Native não tem cache eficiente. O `react-native-fast-image` (ou `@d11/react-native-fast-image`) resolve isso com cache nativo agressivo.

```tsx
import FastImage from 'react-native-fast-image';

<FastImage
  source={{
    uri: 'https://example.com/photo.jpg',
    priority: FastImage.priority.normal,
    cache: FastImage.cacheControl.immutable,
  }}
  style={{ width: 200, height: 200 }}
  resizeMode={FastImage.resizeMode.cover}
/>
```

### 5.2 Formatos otimizados

| Formato | Uso recomendado | Economia vs PNG |
|---|---|---|
| **WebP** | Fotos e imagens complexas (Android + iOS 14+) | 25-35% menor |
| **SVG** | Ícones e ilustrações vetoriais | Até 90% menor |
| **HEIC** | Fotos (iOS nativo) | 30-50% menor |

### 5.3 Boas práticas para imagens

- **Redimensione antes de incluir no app**: nunca inclua uma imagem 4000x3000 para exibir em 200x200. Redimensione para o tamanho exato de exibição (considerando @2x e @3x).
- **Comprima antes de usar**: ferramentas como TinyPNG, ImageOptim ou Squoosh reduzem o tamanho sem perda visual perceptível.
- **Use progressive loading**: mostre um placeholder blur ou skeleton enquanto a imagem carrega.
- **Prefira imagens remotas + cache** a embutir imagens grandes no bundle.
- **Defina dimensões explícitas**: sempre passe `width` e `height` para evitar layout shifts.

### 5.4 Fontes

- Inclua apenas os pesos que realmente usa (ex: Regular e Bold, não a família inteira).
- Prefira fontes no formato `.otf` (geralmente menores que `.ttf`).
- Carregue fontes com `expo-font` ou equivalente no startup, não sob demanda.

---

## 6. Animações Performáticas

Animações mal implementadas são a causa mais visível de "jank". O segredo é manter animações fora da JS thread.

### 6.1 Hierarquia de opções (da mais simples à mais poderosa)

| Opção | Quando usar | Thread |
|---|---|---|
| `LayoutAnimation` | Animações simples de layout (aparecer, sumir, reordenar) | UI Thread |
| `Animated` + `useNativeDriver: true` | Animações de transform/opacity | UI Thread |
| `react-native-reanimated` | Animações complexas, baseadas em gestos, interruptíveis | UI Thread (worklets) |

### 6.2 Sempre use Native Driver quando possível

```tsx
// ❌ Ruim: animação roda na JS thread (causa jank)
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 300,
  useNativeDriver: false,  // <- JS thread
}).start();

// ✅ Bom: animação roda na UI thread nativa
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true,   // <- UI thread
}).start();
```

**Propriedades compatíveis com `useNativeDriver: true`:**
- `transform` (translateX, translateY, scale, rotate, etc.)
- `opacity`

**Propriedades NÃO compatíveis:**
- `width`, `height`, `top`, `left`, `margin`, `padding`

Para animar propriedades de layout, use `LayoutAnimation` ou `react-native-reanimated`.

### 6.3 React Native Reanimated

Para animações complexas e baseadas em gestos, Reanimated é o padrão da indústria. Ele usa "worklets" — funções que rodam diretamente na UI thread, sem passar pela bridge.

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const Component = () => {
  const offset = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(offset.value) }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      {/* conteúdo */}
    </Animated.View>
  );
};
```

### 6.4 Regras para animações suaves

- **Nunca anime propriedades de layout** (`width`, `height`, `margin`). Use `transform` + `opacity`.
- **Adie trabalho pesado durante animações**: use `InteractionManager.runAfterInteractions()` para agendar tarefas após transições terminarem.
- **Limpe animações no unmount**: listeners e subscriptions de animação que não são removidos causam memory leaks.
- **Prefira spring a timing**: animações spring parecem mais naturais e frequentemente performam melhor.

---

## 7. Gerenciamento de Estado Eficiente

A escolha e o uso do gerenciamento de estado impactam diretamente quantos re-renders acontecem no app.

### 7.1 Princípio: estado certo no lugar certo

| Tipo de estado | Solução recomendada | Exemplo |
|---|---|---|
| Estado local do componente | `useState` / `useReducer` | Toggle de modal, input de texto |
| Estado global da UI | Zustand | Tema, filtros ativos, drawer aberto |
| Estado do servidor (dados remotos) | React Query / TanStack Query | Lista de repertório, dados do usuário |
| Estado de formulário | React Hook Form | Formulário de agendamento |
| Estado de navegação | React Navigation | Tela ativa, params de rota |

### 7.2 Zustand — Selectors granulares

O maior erro com Zustand é ler o store inteiro em um componente. Isso faz o componente re-renderizar em qualquer mudança do store, mesmo campos irrelevantes.

```tsx
// ❌ Ruim: re-renderiza em QUALQUER mudança do store
const Component = () => {
  const store = useStore();
  return <Text>{store.userName}</Text>;
};

// ✅ Bom: re-renderiza APENAS quando userName muda
const Component = () => {
  const userName = useStore((state) => state.userName);
  return <Text>{userName}</Text>;
};
```

### 7.3 React Query — Cache inteligente

React Query evita requisições desnecessárias através de cache automático e revalidação inteligente.

```tsx
const { data: repertoire } = useQuery({
  queryKey: ['repertoire'],
  queryFn: fetchRepertoire,
  staleTime: 5 * 60 * 1000,     // dados frescos por 5 minutos
  gcTime: 30 * 60 * 1000,       // mantém cache por 30 min
  refetchOnWindowFocus: false,    // não refetch ao voltar pra tela
});
```

### 7.4 Evite prop drilling profundo

Cada nível de prop drilling é um componente que potencialmente re-renderiza. Para dados que precisam atravessar muitos níveis, use Zustand ou Context com `React.memo` nos intermediários.

---

## 8. Redução do Bundle Size

Cada KB a mais no bundle significa mais tempo para o Hermes parsear, mais memória consumida e mais tempo de download.

### 8.1 Analise antes de cortar

Use ferramentas para visualizar o que está pesando no bundle:

```bash
# Visualizador gráfico do bundle
npx react-native-bundle-visualizer

# APK Analyzer (Android Studio)
# Build > Analyze APK... > selecione o .apk
```

### 8.2 Remova dependências não utilizadas

```bash
# Audite dependências não utilizadas
npx depcheck
```

Projetos grandes acumulam pacotes mortos ao longo do tempo. Uma auditoria regular com `depcheck` revela imports silenciosos que pesam no bundle sem contribuir nada.

### 8.3 Imports seletivos (cherry-picking)

```tsx
// ❌ Ruim: importa a biblioteca inteira (~70KB)
import _ from 'lodash';
const result = _.get(obj, 'path.to.value');

// ✅ Bom: importa apenas a função (~2KB)
import get from 'lodash/get';
const result = get(obj, 'path.to.value');
```

**Substituições leves para bibliotecas pesadas:**

| Pesada | Leve | Economia |
|---|---|---|
| `moment` (~300KB) | `dayjs` (~7KB) | ~97% |
| `lodash` (~70KB) | `lodash/[função]` ou ES nativo | 60-90% |
| `axios` (~40KB) | `fetch` nativo | 100% |

### 8.4 Lazy Loading de telas

Carregue telas apenas quando necessário em vez de importar todas no startup:

```tsx
// ❌ Ruim: todas as telas carregam no startup
import HomeScreen from './screens/Home';
import SettingsScreen from './screens/Settings';
import ProfileScreen from './screens/Profile';

// ✅ Bom: telas carregam sob demanda
const HomeScreen = React.lazy(() => import('./screens/Home'));
const SettingsScreen = React.lazy(() => import('./screens/Settings'));
const ProfileScreen = React.lazy(() => import('./screens/Profile'));
```

### 8.5 Android App Bundle (AAB)

Configure o Android para gerar bundles otimizados por dispositivo:

```groovy
// android/app/build.gradle
android {
    bundle {
        language { enableSplit = true }
        density { enableSplit = true }
        abi { enableSplit = true }
    }
}
```

Isso garante que o usuário baixe apenas os recursos necessários para seu dispositivo específico, resultando em 15-35% de redução no tamanho do download.

### 8.6 Remova console.log em produção

Statements `console.log` em produção causam overhead real — serialização de objetos e comunicação com a bridge.

```bash
# Instale o plugin babel
npm install babel-plugin-transform-remove-console --save-dev
```

```javascript
// babel.config.js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
};
```

---

## 9. Gerenciamento de Memória e Prevenção de Leaks

Memory leaks são sutis mas destrutivos. Diferente de browsers que limpam ao navegar, apps mobile ficam na memória por muito mais tempo. Um leak pequeno se acumula e eventualmente causa crashes.

### 9.1 Causas mais comuns de leaks

1. **Listeners e subscriptions não removidos no unmount**
2. **Timers (setTimeout, setInterval) não limpos**
3. **Closures que seguram referências a componentes desmontados**
4. **Imagens grandes carregadas na memória sem liberação**
5. **Shared values do Reanimated em listas grandes** (versões anteriores à 3.x)

### 9.2 Padrão obrigatório: cleanup no useEffect

```tsx
// ✅ Sempre retorne a função de cleanup
useEffect(() => {
  const subscription = eventEmitter.addListener('event', handler);
  const timer = setInterval(doWork, 5000);

  return () => {
    subscription.remove();  // limpa listener
    clearInterval(timer);   // limpa timer
  };
}, []);
```

### 9.3 Cuidado com fetch em componentes desmontados

```tsx
useEffect(() => {
  const controller = new AbortController();

  const fetchData = async () => {
    try {
      const response = await fetch(url, { signal: controller.signal });
      const data = await response.json();
      setData(data); // seguro: só executa se não abortou
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(error);
      }
    }
  };

  fetchData();
  return () => controller.abort(); // cancela fetch no unmount
}, [url]);
```

### 9.4 Monitore o consumo de memória

- **iOS**: Xcode Instruments > Leaks / Allocations
- **Android**: Android Studio Profiler > Memory
- **Cross-platform**: Flipper > Memory Plugin

A regra prática: se a memória sobe consistentemente ao navegar entre telas e nunca volta ao baseline, existe um leak.

---

## 10. Navegação Otimizada

### 10.1 Prefira Native Stack Navigator

```tsx
// ❌ Mais lento: transições calculadas em JS
import { createStackNavigator } from '@react-navigation/stack';

// ✅ Mais rápido: transições nativas, não bloqueadas pela JS thread
import { createNativeStackNavigator } from '@react-navigation/native-stack';
```

O Native Stack utiliza `UINavigationController` (iOS) e `Fragment` (Android) para transições, rodando inteiramente na UI thread.

### 10.2 Adie trabalho pesado pós-navegação

```tsx
useEffect(() => {
  // Espera a animação de transição terminar antes de fazer trabalho pesado
  InteractionManager.runAfterInteractions(() => {
    fetchHeavyData();
    processComplexLogic();
  });
}, []);
```

### 10.3 Lazy loading de telas na navegação

Configure telas para carregar apenas quando acessadas pela primeira vez, não quando o navigator é montado. A maioria dos navigators do React Navigation já faz isso por padrão, mas verifique se não está pré-carregando telas desnecessariamente com `initialRouteName` ou `tabBarLazy`.

---

## 11. Rede e Requisições

### 11.1 Cache com React Query

Já coberto na seção 7.3, mas vale reforçar: React Query reduz requisições repetidas automaticamente. Configure `staleTime` adequado ao tipo de dado — dados que mudam raramente (como configuração do usuário) podem ter `staleTime` de 30+ minutos.

### 11.2 Paginação e Infinite Scroll

Nunca carregue uma lista inteira de uma vez. Use paginação com cursor ou offset:

```tsx
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['repertoire'],
  queryFn: ({ pageParam = 0 }) => fetchRepertoire({ offset: pageParam }),
  getNextPageParam: (lastPage) => lastPage.nextOffset,
});

<FlashList
  data={data?.pages.flatMap(page => page.items) ?? []}
  renderItem={renderItem}
  estimatedItemSize={80}
  onEndReached={() => hasNextPage && fetchNextPage()}
  onEndReachedThreshold={0.5}
/>
```

### 11.3 Debounce em buscas

```tsx
const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 300); // espera 300ms de pausa

const { data } = useQuery({
  queryKey: ['search', debouncedQuery],
  queryFn: () => searchRepertoire(debouncedQuery),
  enabled: debouncedQuery.length >= 2,
});
```

---

## 12. Ferramentas de Profiling e Diagnóstico

### 12.1 Ferramentas essenciais

| Ferramenta | O que mede | Plataforma |
|---|---|---|
| **React DevTools Profiler** | Re-renders, tempo de render por componente | Cross-platform |
| **Flipper** | Network, layout, memória, logs | Cross-platform |
| **Xcode Instruments** | CPU, memória, leaks, energy | iOS |
| **Android Studio Profiler** | CPU, memória, network, energy | Android |
| **Performance Monitor** (RN built-in) | FPS (JS + UI thread) em tempo real | Cross-platform |
| **react-native-bundle-visualizer** | Tamanho do bundle por módulo | Cross-platform |
| **Flashlight** | Benchmarking tipo Lighthouse para mobile | Cross-platform |

### 12.2 Como ativar o Performance Monitor

No emulador ou device com Dev Menu habilitado:
1. Shake o dispositivo ou `Cmd+D` (iOS) / `Cmd+M` (Android).
2. Toque em "Perf Monitor".
3. Observe os dois FPS indicators: **JS** e **UI**.
4. Se JS FPS cai abaixo de 50 durante uma ação, há trabalho pesado na JS thread.
5. Se UI FPS cai, há problema na thread nativa (animações, layout complexo).

### 12.3 Workflow de diagnóstico

```
1. Identifique o sintoma (scroll lento? transição travada? startup longo?)
     ↓
2. Meça com Performance Monitor (JS ou UI thread?)
     ↓
3. Se JS thread → React DevTools Profiler → encontre o componente lento
     ↓
4. Se UI thread → Xcode Instruments / Android Profiler → verifique overdraw/animações
     ↓
5. Se memória → Flipper Memory Plugin → encontre o leak
     ↓
6. Aplique a otimização específica
     ↓
7. Meça novamente e compare
```

---

## 13. Configurações de Build para Produção

### 13.1 Android — ProGuard e Shrinking

```groovy
// android/app/build.gradle
android {
    buildTypes {
        release {
            minifyEnabled true          // minifica código Java/Kotlin
            shrinkResources true        // remove recursos não utilizados
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'),
                          'proguard-rules.pro'
        }
    }
}
```

### 13.2 iOS — Bitcode e Otimizações

No Xcode, para o target de Release:
- **Optimization Level**: `-Os` (Smallest, Fastest)
- **Strip Debug Symbols**: Yes
- **Enable Dead Code Stripping**: Yes

### 13.3 Metro Bundler

```javascript
// metro.config.js
module.exports = {
  transformer: {
    minifierConfig: {
      compress: {
        drop_console: true,   // remove console.* em prod
      },
    },
  },
};
```

---

## 14. Checklist de Performance

Use este checklist antes de cada release ou quando investigar problemas de performance.

### Engine e Build
- [ ] Hermes está habilitado para Android e iOS?
- [ ] Build está em modo Release (não Debug)?
- [ ] ProGuard/R8 está habilitado para Android?
- [ ] `console.log` está removido em produção?
- [ ] Android App Bundle (AAB) está configurado com splits?

### Renderização
- [ ] Componentes pesados usam `React.memo`?
- [ ] Callbacks passados como props usam `useCallback`?
- [ ] Cálculos caros usam `useMemo`?
- [ ] Nenhuma função arrow inline em `renderItem`?
- [ ] Estado é gerenciado no nível mais baixo possível?

### Listas
- [ ] Usa FlashList em vez de FlatList para listas grandes?
- [ ] `estimatedItemSize` ou `getItemLayout` está definido?
- [ ] `keyExtractor` usa IDs estáveis (não index)?
- [ ] Componente do item é memoizado?
- [ ] Imagens dentro de listas usam cache (FastImage)?

### Imagens e Assets
- [ ] Imagens estão redimensionadas para o tamanho de exibição?
- [ ] Formato WebP é usado quando possível?
- [ ] Imagens remotas usam FastImage com cache?
- [ ] Fontes incluem apenas os pesos utilizados?
- [ ] Dimensões explícitas estão definidas nas imagens?

### Animações
- [ ] `useNativeDriver: true` em todas as animações compatíveis?
- [ ] Nenhuma animação em propriedades de layout (`width`, `height`, `margin`)?
- [ ] Animações complexas usam Reanimated?
- [ ] `InteractionManager` é usado para adiar trabalho durante transições?

### Memória
- [ ] Todo `useEffect` com subscriptions tem cleanup?
- [ ] Timers são limpos no unmount?
- [ ] Requisições fetch são canceláveis (AbortController)?
- [ ] Memória retorna ao baseline ao navegar entre telas?

### Rede
- [ ] React Query (ou similar) está configurado com cache adequado?
- [ ] Listas grandes usam paginação?
- [ ] Campos de busca têm debounce?
- [ ] Dados raramente atualizados têm `staleTime` alto?

### Bundle Size
- [ ] Bundle foi analisado com `react-native-bundle-visualizer`?
- [ ] Dependências não utilizadas foram removidas (`depcheck`)?
- [ ] Imports são seletivos (cherry-picking)?
- [ ] Bibliotecas pesadas têm alternativas leves?
- [ ] Telas não-críticas usam lazy loading?

### Navegação
- [ ] Usa `createNativeStackNavigator`?
- [ ] Trabalho pesado é adiado com `InteractionManager`?

---

## Referências

- [React Native — Performance Overview](https://reactnative.dev/docs/performance) (Documentação oficial)
- [React Native — Optimizing FlatList](https://reactnative.dev/docs/optimizing-flatlist-configuration) (Documentação oficial)
- [Callstack — The Ultimate Guide to React Native Optimization](https://www.callstack.com/ebooks/the-ultimate-guide-to-react-native-optimization) (Referência da indústria)
- [Shopify FlashList](https://shopify.github.io/flash-list/) (Documentação oficial)
- [Sentry — React Native Performance Tactics](https://blog.sentry.io/react-native-performance-strategies-tools/) (Guia prático 2025)

---

> **Priorize por impacto:** Comece habilitando Hermes, substitua FlatList por FlashList, otimize imagens e configure selectors granulares no Zustand. Essas quatro mudanças entregam 60-80% da melhoria possível com esforço mínimo. As otimizações avançadas (Reanimated, code splitting, ProGuard) vêm depois, guiadas por profiling real.
