import { useState, useEffect } from 'react';
import { getInviteList, generateInvites, updateInviteStatus } from '../../api/admin';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

interface InviteCode {
  id: number;
  code: string;
  status: number;
  use_user_id: number | null;
  expire_time: string | null;
  use_time: string | null;
  create_time: string;
}

const statusMap: Record<number, string> = { 0: '未使用', 1: '已使用', 2: '已过期', 3: '已禁用' };

export default function InviteManage() {
  const [invites, setInvites] = useState<InviteCode[]>([]);
  const [, setTotal] = useState(0);
  const [page] = useState(1);
  const [loading, setLoading] = useState(true);
  const [genCount, setGenCount] = useState(1);
  const [expireDays, setExpireDays] = useState(0);
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();

  const fetchInvites = () => {
    setLoading(true);
    getInviteList(page)
      .then((data: any) => {
        setInvites(data.list);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInvites(); }, [page]);

  const handleGenerate = async () => {
    try {
      await generateInvites(genCount, expireDays);
      fetchInvites();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDisable = async (id: number) => {
    if (!(await showConfirm('确定禁用这个邀请码吗？'))) return;
    await updateInviteStatus(id, 3);
    fetchInvites();
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>邀请码管理</h2>

      <div style={{ background: 'var(--color-bg-white)', padding: 20, borderRadius: 8, marginBottom: 20, boxShadow: 'var(--shadow-card)', display: 'flex', gap: 12, alignItems: 'center' }}>
        <span>生成</span>
        <input type="number" min={1} max={100} value={genCount} onChange={e => setGenCount(Number(e.target.value))}
          style={{ width: 80, padding: '6px 8px', border: '1px solid var(--color-border)', borderRadius: 4, background: 'var(--color-bg-white)', color: 'var(--color-text)' }} />
        <span>个邀请码，有效期</span>
        <input type="number" min={0} value={expireDays} onChange={e => setExpireDays(Number(e.target.value))}
          style={{ width: 80, padding: '6px 8px', border: '1px solid var(--color-border)', borderRadius: 4, background: 'var(--color-bg-white)', color: 'var(--color-text)' }} />
        <span>天（0=永久）</span>
        <button onClick={handleGenerate} style={{ padding: '6px 20px', background: 'var(--color-primary)', color: 'var(--color-text-inverse)', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          生成
        </button>
      </div>

      <div style={{ background: 'var(--color-bg-white)', borderRadius: 8, boxShadow: 'var(--shadow-card)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg-elevated)', borderBottom: '1px solid var(--color-border-light)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13 }}>邀请码</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13 }}>状态</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13 }}>有效期</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13 }}>创建时间</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-hint)' }}>加载中...</td></tr>
            ) : invites.map(inv => (
              <tr key={inv.id} style={{ borderBottom: '1px solid var(--color-border-lighter)' }}>
                <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 13 }}>{inv.code}</td>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>{statusMap[inv.status]}</td>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>
                  {inv.expire_time ? new Date(inv.expire_time).toLocaleDateString('zh-CN') : '永久有效'}
                </td>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>{new Date(inv.create_time).toLocaleDateString('zh-CN')}</td>
                <td style={{ padding: '10px 16px' }}>
                  {inv.status === 0 && (
                    <button onClick={() => handleDisable(inv.id)} style={{ color: 'var(--color-error)', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13 }}>
                      禁用
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
