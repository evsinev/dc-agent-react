import useSWR from 'swr';

export function useAppInfo(params: { infoKey: string }) {
  const mock = new Promise((resolve) => {
    setTimeout(() => {
      resolve('<section><h4>Mock title</h4><p>Mock description</p></section>');
    }, 2000);
  });

  return useSWR(`/app/info/${params.infoKey}`, () => mock);
}
