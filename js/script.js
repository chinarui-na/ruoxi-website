// ========================================
// 现代化网站交互脚本 - 若溪科技
// ========================================

// ===== 导航栏滚动效果 =====
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const backToTop = document.querySelector('.back-to-top');

    // 导航栏样式变化
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // 返回顶部按钮显示/隐藏
    if (window.scrollY > 300) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }
});

// ===== 移动端菜单切换 =====
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // 点击菜单项关闭移动端菜单
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // 点击菜单外部关闭菜单
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ===== 平滑滚动 =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const offsetTop = target.offsetTop - 80; // 导航栏高度
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===== 数字动画 =====
let numbersAnimated = false;

function animateNumbers() {
    if (numbersAnimated) return;
    numbersAnimated = true;

    const stats = document.querySelectorAll('.stat-number');

    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const duration = 2000; // 2秒
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateNumber = () => {
            if (current < target) {
                current += increment;
                stat.textContent = Math.ceil(current);
                requestAnimationFrame(updateNumber);
            } else {
                stat.textContent = target;
            }
        };

        updateNumber();
    });
}

// ===== 滚动动画观察器 =====
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');

            // 如果是统计数据区域，启动数字动画
            if (entry.target.classList.contains('hero-stats')) {
                animateNumbers();
            }
        }
    });
}, observerOptions);

// 观察需要动画的元素
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll(
        '.about-card, .service-card, .portfolio-item, .info-card, .hero-stats'
    );

    animatedElements.forEach(el => {
        fadeInObserver.observe(el);
    });
});

// ===== 作品集过滤 =====
const filterButtons = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // 移除所有按钮的active类
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // 给当前按钮添加active类
        button.classList.add('active');

        const filterValue = button.getAttribute('data-filter');

        portfolioItems.forEach((item, index) => {
            const category = item.getAttribute('data-category');

            if (filterValue === 'all' || category === filterValue) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0) scale(1)';
                }, index * 100);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px) scale(0.9)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    });
});

// ===== 返回顶部按钮 =====
const backToTopButton = document.getElementById('backToTop');

if (backToTopButton) {
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===== 表单数据管理 =====
class FormDataManager {
    constructor() {
        this.storageKey = 'ruoxi_contact_submissions';
    }

    // 保存表单数据到 LocalStorage
    saveToLocal(data) {
        try {
            const submissions = this.getAllSubmissions();
            submissions.push({
                ...data,
                id: Date.now(),
                timestamp: new Date().toISOString(),
                status: 'pending'
            });
            localStorage.setItem(this.storageKey, JSON.stringify(submissions));
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            return false;
        }
    }

    // 获取所有提交记录
    getAllSubmissions() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('读取数据失败:', error);
            return [];
        }
    }

    // 导出为 JSON 文件
    exportToJSON() {
        const submissions = this.getAllSubmissions();
        const dataStr = JSON.stringify(submissions, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `contact_submissions_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    // 导出为 CSV 文件
    exportToCSV() {
        const submissions = this.getAllSubmissions();
        if (submissions.length === 0) {
            alert('暂无数据可导出');
            return;
        }

        // CSV 表头
        const headers = ['ID', '姓名', '邮箱', '电话', '公司', '服务类型', '预算', '留言', '提交时间', '状态'];
        const csvRows = [headers.join(',')];

        // CSV 数据行
        submissions.forEach(item => {
            const row = [
                item.id,
                item.name,
                item.email,
                item.phone || '',
                item.company || '',
                item.service || '',
                item.budget || '',
                `"${(item.message || '').replace(/"/g, '""')}"`,
                item.timestamp,
                item.status
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `contact_submissions_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }

    // 发送到后端服务器（预留接口）
    async sendToServer(data) {
        try {
            // 这里替换为你的实际后端 API 地址
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('服务器响应错误');
            }

            return await response.json();
        } catch (error) {
            console.error('发送到服务器失败:', error);
            throw error;
        }
    }

    // 清空所有数据
    clearAll() {
        if (confirm('确定要清空所有提交记录吗？此操作不可恢复！')) {
            localStorage.removeItem(this.storageKey);
            alert('数据已清空');
        }
    }

    // 获取统计信息
    getStats() {
        const submissions = this.getAllSubmissions();
        return {
            total: submissions.length,
            pending: submissions.filter(s => s.status === 'pending').length,
            processed: submissions.filter(s => s.status === 'processed').length
        };
    }
}

// 创建表单数据管理器实例
const formManager = new FormDataManager();

// ===== 表单提交 =====
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 获取表单数据
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            company: formData.get('company'),
            service: formData.get('service'),
            budget: formData.get('budget'),
            message: formData.get('message')
        };

        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;

        // 显示加载状态
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>发送中...</span>';
        submitButton.disabled = true;

        try {
            // 1. 保存到本地存储
            const savedLocally = formManager.saveToLocal(data);

            // 2. 尝试发送到服务器（如果有后端的话）
            // await formManager.sendToServer(data);

            // 模拟网络延迟
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 显示成功状态
            submitButton.innerHTML = '<i class="fas fa-check"></i> <span>发送成功</span>';

            setTimeout(() => {
                const stats = formManager.getStats();
                alert(`感谢您的留言！我们会在24小时内回复您。\n\n已保存 ${stats.total} 条留言记录。`);
                contactForm.reset();
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }, 1000);

        } catch (error) {
            console.error('提交失败:', error);
            submitButton.innerHTML = '<i class="fas fa-times"></i> <span>发送失败</span>';

            setTimeout(() => {
                alert('提交失败，请稍后重试或直接联系我们。');
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }, 1500);
        }
    });
}

// ===== 添加数据管理按钮（开发者工具）=====
// 在控制台中可以使用以下命令：
// formManager.getAllSubmissions() - 查看所有提交
// formManager.exportToJSON() - 导出为 JSON
// formManager.exportToCSV() - 导出为 CSV
// formManager.clearAll() - 清空所有数据
// formManager.getStats() - 查看统计信息

// 将 formManager 暴露到全局，方便在控制台使用
window.formManager = formManager;

// ===== 页面加载动画 =====
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// ===== 鼠标悬停卡片倾斜效果 =====
const cards = document.querySelectorAll('.service-card, .portfolio-card, .about-card');

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// ===== 动态背景球体移动 =====
const orbs = document.querySelectorAll('.gradient-orb');

document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    orbs.forEach((orb, index) => {
        const speed = (index + 1) * 20;
        const x = (mouseX - 0.5) * speed;
        const y = (mouseY - 0.5) * speed;

        orb.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// ===== 滚动进度指示器（可选） =====
function updateScrollProgress() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollProgress = (scrollTop / scrollHeight) * 100;

    // 可以在这里添加进度条显示
    // document.querySelector('.scroll-progress').style.width = scrollProgress + '%';
}

window.addEventListener('scroll', updateScrollProgress);

// ===== 懒加载图片 =====
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===== 控制台彩蛋 =====
console.log(
    '%c若溪科技 🚀',
    'font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'
);
console.log(
    '%c欢迎访问我们的网站！如果您对我们的服务感兴趣，请联系我们。',
    'font-size: 14px; color: #667eea;'
);